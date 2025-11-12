const STEAM_API_BASE = "https://api.steampowered.com";
const STEAM_STORE_BASE = "https://store.steampowered.com/api";

export interface SteamGame {
  appid: number;
  name: string;
  image?: string;
  price?: string;
  originalPrice?: string;
  discountPercent?: number;
  isFree?: boolean;
  requiredAge?: number;
  genres?: string[];
  releaseDate?: string;
}

export interface SteamGameDetails {
  [key: string]: {
    success: boolean;
    data: {
      type: string;
      name: string;
      steam_appid: number;
      required_age: number;
      is_free: boolean;
      detailed_description: string;
      about_the_game: string;
      short_description: string;
      supported_languages: string;
      header_image: string;
      website: string;
      pc_requirements: {
        minimum?: string;
        recommended?: string;
      };
      mac_requirements: {
        minimum?: string;
        recommended?: string;
      };
      linux_requirements: {
        minimum?: string;
        recommended?: string;
      };
      developers: string[];
      publishers: string[];
      price_overview?: {
        currency: string;
        initial: number;
        final: number;
        discount_percent: number;
      };
      platforms: {
        windows: boolean;
        mac: boolean;
        linux: boolean;
      };
      categories: Array<{ id: number; description: string }>;
      genres: Array<{ id: number; description: string }>;
      screenshots: Array<{ id: number; path_thumbnail: string; path_full: string }>;
      movies?: Array<{ id: number; name: string; thumbnail: string; webm: { [key: string]: string } }>;
      release_date: {
        coming_soon: boolean;
        date: string;
      };
      background: string;
      background_raw: string;
      metacritic?: {
        score: number;
        url: string;
      };
    };
  };
}

export interface SearchFilters {
  excludeNSFW?: boolean;
  maxPrice?: number;
  minPrice?: number;
  genres?: string[];
  freeOnly?: boolean;
  onSaleOnly?: boolean;
}

export async function searchSteamGames(
  query: string,
  filters?: SearchFilters
): Promise<SteamGame[]> {
  try {
    // Steam store search endpoint
    // Note: Steam's store search API format may vary, so we try the standard endpoint first
    const searchUrl = `${STEAM_STORE_BASE}/storesearch/?term=${encodeURIComponent(query)}&cc=US&l=en`;
    
    console.log("Searching Steam for:", query);
    
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      console.error(`Steam API error: ${response.status} ${response.statusText}`);
      // Try alternative endpoint format
      return await searchSteamGamesAlternative(query, filters);
    }

    const text = await response.text();
    let data: any;
    
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", text.substring(0, 200));
      // Try alternative endpoint
      return await searchSteamGamesAlternative(query, filters);
    }
    
    console.log("Steam search response keys:", Object.keys(data));
    
    // Handle different response formats
    let items: any[] = [];
    
    if (data.items && Array.isArray(data.items)) {
      items = data.items;
    } else if (data.results && Array.isArray(data.results)) {
      items = data.results;
    } else if (Array.isArray(data)) {
      items = data;
    } else if (data.query && data.query.items && Array.isArray(data.query.items)) {
      items = data.query.items;
    } else {
      console.warn("Unexpected Steam API response format. Keys:", Object.keys(data));
      // Try alternative endpoint
      return await searchSteamGamesAlternative(query, filters);
    }

    if (items.length === 0) {
      console.log("No items found in response, trying alternative method");
      return await searchSteamGamesAlternative(query, filters);
    }

    let games = items
      .filter((item: any) => {
        // Filter for games and DLCs, but be more lenient
        const itemType = (item.type || '').toLowerCase();
        const hasValidId = item.id || item.appid;
        const hasName = item.name || item.title;
        
        // Accept games, DLCs, bundles, or any item with an ID and name
        return hasValidId && hasName;
      })
      .map((item: any) => {
        const appid = item.id || item.appid;
        const priceFinal = item.price?.final || item.final_price || item.price?.final_price;
        const priceOriginal = item.price?.original || item.original_price || item.price?.original_price;
        const discountPercent = item.price?.discount_percent || item.discount_percent || 0;
        const isFree = priceFinal === 0 || item.is_free || false;
        const requiredAge = item.required_age || item.requiredAge || 0;
        
        // Prioritize larger/higher quality images
        // Steam provides: header_image (460x215), capsule_image (467x181), small_image (231x87), tiny_image (184x69)
        const imageUrl = item.header_image || 
                        item.capsule_image || 
                        item.capsule || 
                        item.small_image || 
                        item.tiny_image || 
                        undefined;
        
        // If we have an appid, try to get the highest quality header image
        // Steam's header.jpg is typically 460x215, much better than tiny/small images
        let finalImageUrl = imageUrl;
        if (appid) {
          if (!imageUrl || imageUrl.includes('tiny') || imageUrl.includes('small') || imageUrl.includes('capsule_184')) {
            // Use Steam's header image which is higher quality
            finalImageUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`;
          }
        }
        
        return {
          appid: Number(appid),
          name: item.name || item.title || 'Unknown',
          image: finalImageUrl,
          price: isFree ? "Free" : priceFinal ? `$${(priceFinal / 100).toFixed(2)}` : undefined,
          originalPrice: priceOriginal && priceOriginal !== priceFinal ? `$${(priceOriginal / 100).toFixed(2)}` : undefined,
          discountPercent: discountPercent > 0 ? discountPercent : undefined,
          isFree: isFree,
          requiredAge: requiredAge,
          genres: item.genres?.map((g: any) => g.description || g) || [],
        };
      })
      .filter((game: SteamGame) => game.appid && game.name !== 'Unknown' && !isNaN(game.appid));

    // Apply filters
    if (filters) {
      games = games.filter((game) => {
        // NSFW filter (exclude games with required_age >= 18 or adult content)
        if (filters.excludeNSFW && game.requiredAge && game.requiredAge >= 18) {
          return false;
        }

        // Price filters
        if (filters.freeOnly && !game.isFree) {
          return false;
        }

        if (filters.onSaleOnly && !game.discountPercent) {
          return false;
        }

        if (filters.maxPrice !== undefined && !game.isFree && game.price) {
          const priceNum = parseFloat(game.price.replace('$', ''));
          if (priceNum > filters.maxPrice) {
            return false;
          }
        }

        if (filters.minPrice !== undefined && !game.isFree && game.price) {
          const priceNum = parseFloat(game.price.replace('$', ''));
          if (priceNum < filters.minPrice) {
            return false;
          }
        }

        // Genre filter
        if (filters.genres && filters.genres.length > 0) {
          const gameGenres = game.genres?.map((g: string) => g.toLowerCase()) || [];
          const hasMatchingGenre = filters.genres.some((filterGenre: string) =>
            gameGenres.some((gameGenre: string) => gameGenre.includes(filterGenre.toLowerCase()))
          );
          if (!hasMatchingGenre) {
            return false;
          }
        }

        return true;
      });
    }

    console.log(`Found ${games.length} games after filtering`);
    return games.length > 0 ? games : await searchSteamGamesAlternative(query, filters);
  } catch (error: any) {
    console.error("Error searching Steam games:", error);
    // Try alternative method as fallback
    try {
      return await searchSteamGamesAlternative(query, filters);
    } catch (fallbackError) {
      console.error("Fallback search also failed:", fallbackError);
      throw new Error(`Failed to search Steam games: ${error?.message || 'Unknown error'}`);
    }
  }
}

// Alternative search method - try different endpoint variations
async function searchSteamGamesAlternative(query: string, filters?: SearchFilters): Promise<SteamGame[]> {
  const endpoints = [
    `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&cc=US&l=en`,
    `https://store.steampowered.com/api/storesearch/?q=${encodeURIComponent(query)}&cc=US&l=en`,
    `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}`,
  ];

  for (const url of endpoints) {
    try {
      console.log("Trying alternative endpoint:", url);
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        continue; // Try next endpoint
      }

      const text = await response.text();
      let data: any;
      
      try {
        data = JSON.parse(text);
      } catch {
        continue; // Try next endpoint
      }
      
      // Try different response structures
      let items: any[] = [];
      if (data.items && Array.isArray(data.items)) {
        items = data.items;
      } else if (data.results && Array.isArray(data.results)) {
        items = data.results;
      } else if (Array.isArray(data)) {
        items = data;
      } else if (data.query?.items && Array.isArray(data.query.items)) {
        items = data.query.items;
      }

      if (items.length > 0) {
        console.log(`Alternative endpoint found ${items.length} items`);
        let games = items
          .filter((item: any) => item.id && item.name)
          .map((item: any) => {
            const priceFinal = item.price?.final || item.final_price;
            const priceOriginal = item.price?.original || item.original_price;
            const discountPercent = item.price?.discount_percent || item.discount_percent || 0;
            const isFree = priceFinal === 0 || item.is_free || false;
            const requiredAge = item.required_age || item.requiredAge || 0;
            
            // Prioritize larger/higher quality images
            const imageUrl = item.header_image || 
                            item.capsule_image || 
                            item.capsule || 
                            item.small_image || 
                            item.tiny_image || 
                            undefined;
            
            // If we have an appid, try to get the highest quality header image
            let finalImageUrl = imageUrl;
            if (item.id) {
              if (!imageUrl || imageUrl.includes('tiny') || imageUrl.includes('small') || imageUrl.includes('capsule_184')) {
                // Use Steam's header image which is higher quality
                finalImageUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${item.id}/header.jpg`;
              }
            }
            
            return {
              appid: Number(item.id),
              name: item.name,
              image: finalImageUrl,
              price: isFree ? "Free" : priceFinal ? `$${(priceFinal / 100).toFixed(2)}` : undefined,
              originalPrice: priceOriginal && priceOriginal !== priceFinal ? `$${(priceOriginal / 100).toFixed(2)}` : undefined,
              discountPercent: discountPercent > 0 ? discountPercent : undefined,
              isFree: isFree,
              requiredAge: requiredAge,
              genres: item.genres?.map((g: any) => g.description || g) || [],
            };
          })
          .filter((game: SteamGame) => !isNaN(game.appid));

        // Apply filters
        if (filters) {
          games = games.filter((game) => {
            if (filters.excludeNSFW && game.requiredAge && game.requiredAge >= 18) return false;
            if (filters.freeOnly && !game.isFree) return false;
            if (filters.onSaleOnly && !game.discountPercent) return false;
            if (filters.maxPrice !== undefined && !game.isFree && game.price) {
              const priceNum = parseFloat(game.price.replace('$', ''));
              if (priceNum > filters.maxPrice) return false;
            }
            if (filters.minPrice !== undefined && !game.isFree && game.price) {
              const priceNum = parseFloat(game.price.replace('$', ''));
              if (priceNum < filters.minPrice) return false;
            }
            if (filters.genres && filters.genres.length > 0) {
              const gameGenres = game.genres?.map((g: string) => g.toLowerCase()) || [];
              const hasMatchingGenre = filters.genres.some((filterGenre: string) =>
                gameGenres.some((gameGenre: string) => gameGenre.includes(filterGenre.toLowerCase()))
              );
              if (!hasMatchingGenre) return false;
            }
            return true;
          });
        }

        return games;
      }
    } catch (error) {
      console.error(`Alternative endpoint failed: ${url}`, error);
      continue; // Try next endpoint
    }
  }

  console.log("All alternative search methods failed");
  return [];
}

export async function getSteamGameDetails(appId: number): Promise<SteamGameDetails[string]["data"] | null> {
  try {
    const response = await fetch(
      `${STEAM_STORE_BASE}/appdetails/?appids=${appId}&cc=US&l=en`
    );

    if (!response.ok) {
      throw new Error(`Steam API error: ${response.statusText}`);
    }

    const data: SteamGameDetails = await response.json();
    const gameData = data[appId.toString()];

    if (!gameData || !gameData.success) {
      return null;
    }

    return gameData.data;
  } catch (error) {
    console.error("Error fetching Steam game details:", error);
    throw new Error("Failed to fetch game details");
  }
}

export async function getSteamGameReviews(appId: number): Promise<string> {
  try {
    // Get reviews summary from Steam
    const response = await fetch(
      `${STEAM_STORE_BASE}/appreviews/${appId}?json=1&language=all&purchase_type=all&num_per_page=0`
    );

    if (!response.ok) {
      return "No reviews available";
    }

    const data = await response.json();
    
    if (data.query_summary && data.query_summary.total_reviews > 0) {
      const positive = data.query_summary.total_positive || 0;
      const total = data.query_summary.total_reviews || 1;
      const percent = Math.round((positive / total) * 100);
      return `${percent}% positive (${total.toLocaleString()} reviews)`;
    }

    return "No reviews available";
  } catch (error) {
    console.error("Error fetching Steam reviews:", error);
    return "No reviews available";
  }
}

export async function getTrendingGames(): Promise<SteamGame[]> {
  try {
    // Get featured games from Steam Store
    // Using the featured endpoint which shows popular/trending games
    const response = await fetch(
      `${STEAM_STORE_BASE}/featured/?cc=US&l=en`
    );

    if (!response.ok) {
      throw new Error(`Steam API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    const games: SteamGame[] = [];
    
    // Extract games from featured categories
    const processGameItem = (item: any): SteamGame => {
      const priceFinal = item.price?.final || item.final_price;
      const priceOriginal = item.price?.original || item.original_price;
      const discountPercent = item.price?.discount_percent || item.discount_percent || 0;
      const isFree = priceFinal === 0 || item.is_free || false;
      
      // Prioritize larger/higher quality images
      const imageUrl = item.header_image || 
                      item.capsule_image || 
                      item.capsule || 
                      item.small_image || 
                      item.tiny_image || 
                      undefined;
      
      // If we have an appid, try to get the highest quality header image
      let finalImageUrl = imageUrl;
      if (item.id) {
        if (!imageUrl || imageUrl.includes('tiny') || imageUrl.includes('small') || imageUrl.includes('capsule_184')) {
          // Use Steam's header image which is higher quality
          finalImageUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${item.id}/header.jpg`;
        }
      }
      
      return {
        appid: item.id,
        name: item.name,
        image: finalImageUrl,
        price: isFree ? "Free" : priceFinal ? `$${(priceFinal / 100).toFixed(2)}` : undefined,
        originalPrice: priceOriginal && priceOriginal !== priceFinal ? `$${(priceOriginal / 100).toFixed(2)}` : undefined,
        discountPercent: discountPercent > 0 ? discountPercent : undefined,
        isFree: isFree,
      };
    };

    if (data.featured_win) {
      data.featured_win.forEach((item: any) => {
        if (item.id && item.name) {
          games.push(processGameItem(item));
        }
      });
    }
    
    if (data.featured_mac) {
      data.featured_mac.forEach((item: any) => {
        if (item.id && item.name && !games.find(g => g.appid === item.id)) {
          games.push(processGameItem(item));
        }
      });
    }
    
    if (data.featured_linux) {
      data.featured_linux.forEach((item: any) => {
        if (item.id && item.name && !games.find(g => g.appid === item.id)) {
          games.push(processGameItem(item));
        }
      });
    }

    // If featured endpoint doesn't work, fallback to searching popular terms
    if (games.length === 0) {
      // Fallback: get popular games by searching common terms
      const popularTerms = ["action", "adventure", "strategy", "rpg"];
      const allGames: SteamGame[] = [];
      
      for (const term of popularTerms.slice(0, 2)) {
        try {
          const searchResults = await searchSteamGames(term);
          allGames.push(...searchResults.slice(0, 10));
        } catch (e) {
          // Continue with next term
        }
      }
      
      // Remove duplicates and return top 20
      const uniqueGames = Array.from(
        new Map(allGames.map(game => [game.appid, game])).values()
      );
      return uniqueGames.slice(0, 20);
    }

    return games.slice(0, 20);
  } catch (error) {
    console.error("Error fetching trending games:", error);
    // Fallback to popular game search
    try {
      const popularGames = await searchSteamGames("popular");
      return popularGames.slice(0, 20);
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      return [];
    }
  }
}

/**
 * Get new releases from Steam - games released in the last 6 months
 */
export async function getNewReleases(filters?: SearchFilters): Promise<SteamGame[]> {
  try {
    // Get featured/new games from Steam's specials endpoint which includes new releases
    const response = await fetch(
      `${STEAM_STORE_BASE}/specials/?cc=US&l=en`
    );

    const allGames: SteamGame[] = [];
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

    // Try to get games from specials/new releases
    if (response.ok) {
      try {
        const data = await response.json();
        // Process any new release data if available
      } catch (e) {
        // Continue with alternative method
      }
    }

    // Alternative: Search for popular recent games and filter by release date
    const searchTerms = ["new", "recent"];
    const candidateGames: SteamGame[] = [];
    
    for (const term of searchTerms) {
      try {
        const results = await searchSteamGames(term, filters);
        candidateGames.push(...results);
      } catch (e) {
        // Continue
      }
    }

    // Remove duplicates
    const uniqueGames = Array.from(
      new Map(candidateGames.map(game => [game.appid, game])).values()
    );

    // Fetch release dates for games and filter by recent releases
    const gamesWithDates: SteamGame[] = [];
    const datePromises = uniqueGames.slice(0, 50).map(async (game) => {
      try {
        const details = await getSteamGameDetails(game.appid);
        if (details) {
          const releaseDateStr = details.release_date?.date;
          if (releaseDateStr && !details.release_date.coming_soon) {
            // Parse release date (format: "DD MMM, YYYY" or "MMM DD, YYYY")
            const releaseDate = parseReleaseDate(releaseDateStr);
            if (releaseDate && releaseDate >= sixMonthsAgo && releaseDate <= now) {
              return {
                ...game,
                releaseDate: releaseDateStr,
              };
            }
          }
        }
      } catch (e) {
        // Skip if we can't get details
      }
      return null;
    });

    const results = await Promise.all(datePromises);
    const validGames = results.filter((game) => game !== null) as SteamGame[];

    // Sort by release date (newest first)
    validGames.sort((a, b) => {
      const dateA = a.releaseDate ? parseReleaseDate(a.releaseDate) : null;
      const dateB = b.releaseDate ? parseReleaseDate(b.releaseDate) : null;
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB.getTime() - dateA.getTime();
    });

    return validGames.slice(0, 30);
  } catch (error) {
    console.error("Error fetching new releases:", error);
    return [];
  }
}

/**
 * Parse Steam release date string to Date object
 * Handles formats like "1 Jan, 2024", "Jan 1, 2024", "2024-01-01"
 */
function parseReleaseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  try {
    // Try standard date parsing first
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    // Handle Steam's common format: "DD MMM, YYYY" or "MMM DD, YYYY"
    const months: { [key: string]: number } = {
      'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
      'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
    };

    const parts = dateStr.toLowerCase().replace(',', '').trim().split(/\s+/);
    if (parts.length >= 3) {
      const monthStr = parts[0].substring(0, 3);
      const day = parseInt(parts[1] || parts[0]);
      const year = parseInt(parts[2] || parts[parts.length - 1]);

      if (months[monthStr] !== undefined && !isNaN(day) && !isNaN(year)) {
        return new Date(year, months[monthStr], day);
      }
    }

    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Get games by genre
 */
export async function getGamesByGenre(genre: string, filters?: SearchFilters): Promise<SteamGame[]> {
  try {
    const games = await searchSteamGames(genre, filters);
    return games.slice(0, 30);
  } catch (error) {
    console.error(`Error fetching games by genre ${genre}:`, error);
    return [];
  }
}

/**
 * Get free games
 */
export async function getFreeGames(filters?: SearchFilters): Promise<SteamGame[]> {
  try {
    const freeFilters: SearchFilters = { ...filters, freeOnly: true };
    const games = await searchSteamGames("free", freeFilters);
    return games.slice(0, 30);
  } catch (error) {
    console.error("Error fetching free games:", error);
    return [];
  }
}

/**
 * Get games on sale
 */
export async function getGamesOnSale(filters?: SearchFilters): Promise<SteamGame[]> {
  try {
    const saleFilters: SearchFilters = { ...filters, onSaleOnly: true };
    const games = await searchSteamGames("sale", saleFilters);
    return games.slice(0, 30);
  } catch (error) {
    console.error("Error fetching games on sale:", error);
    return [];
  }
}

