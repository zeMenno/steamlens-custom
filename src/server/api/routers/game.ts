import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { 
  searchSteamGames, 
  getSteamGameDetails, 
  getSteamGameReviews, 
  getTrendingGames,
  getNewReleases,
  getGamesByGenre,
  getFreeGames,
  getGamesOnSale,
  getGamesByPriceRange,
  SearchFilters
} from "../services/steam";
import { searchHLTB } from "../services/howlongtobeat";
import { getGeneralGameRecommendations } from "../services/groq";

const searchFiltersSchema = z.object({
  excludeNSFW: z.boolean().optional(),
  maxPrice: z.number().optional(),
  minPrice: z.number().optional(),
  genres: z.array(z.string()).optional(),
  freeOnly: z.boolean().optional(),
  onSaleOnly: z.boolean().optional(),
});

export const gameRouter = createTRPCRouter({
  searchGames: publicProcedure
    .input(z.object({ 
      query: z.string().min(1),
      filters: searchFiltersSchema.optional(),
    }))
    .query(async ({ input }) => {
      const games = await searchSteamGames(input.query, input.filters as SearchFilters);
      return games;
    }),

  getGameDetails: publicProcedure
    .input(z.object({ appId: z.number() }))
    .query(async ({ input }) => {
      const details = await getSteamGameDetails(input.appId);
      if (!details) {
        throw new Error("Game not found");
      }
      return details;
    }),

  getGameReviews: publicProcedure
    .input(z.object({ appId: z.number() }))
    .query(async ({ input }) => {
      const reviews = await getSteamGameReviews(input.appId);
      return reviews;
    }),

  getTrendingGames: publicProcedure
    .query(async () => {
      const games = await getTrendingGames();
      return games;
    }),

  getHowLongToBeat: publicProcedure
    .input(z.object({ 
      gameName: z.string(),
      appId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const hltbData = await searchHLTB(input.gameName, input.appId);
      return hltbData;
    }),

  getNewReleases: publicProcedure
    .input(z.object({ filters: searchFiltersSchema.optional() }).optional())
    .query(async ({ input }) => {
      const games = await getNewReleases(input?.filters as SearchFilters);
      return games;
    }),

  getGamesByGenre: publicProcedure
    .input(z.object({ 
      genre: z.string().min(1),
      filters: searchFiltersSchema.optional(),
    }))
    .query(async ({ input }) => {
      const games = await getGamesByGenre(input.genre, input.filters as SearchFilters);
      return games;
    }),

  getFreeGames: publicProcedure
    .input(z.object({ filters: searchFiltersSchema.optional() }).optional())
    .query(async ({ input }) => {
      const games = await getFreeGames(input?.filters as SearchFilters);
      return games;
    }),

  getGamesOnSale: publicProcedure
    .input(z.object({ filters: searchFiltersSchema.optional() }).optional())
    .query(async ({ input }) => {
      const games = await getGamesOnSale(input?.filters as SearchFilters);
      return games;
    }),

  getGamesByPriceRange: publicProcedure
    .input(z.object({ 
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      filters: searchFiltersSchema.optional(),
    }))
    .query(async ({ input }) => {
      const games = await getGamesByPriceRange(
        input.minPrice,
        input.maxPrice,
        input.filters as SearchFilters
      );
      return games;
    }),

  getAIRecommendedGames: publicProcedure
    .query(async () => {
      // Get a pool of popular games to recommend from
      const trendingGames = await getTrendingGames();
      const newReleases = await getNewReleases();
      const freeGames = await getFreeGames();
      
      // Combine and deduplicate
      const allGames = [
        ...trendingGames,
        ...newReleases,
        ...freeGames,
      ];
      
      const uniqueGames = Array.from(
        new Map(allGames.map(game => [game.appid, game])).values()
      );

      // Get AI recommendations
      const gameList = uniqueGames.map(g => ({ appid: g.appid, name: g.name }));
      const recommendations = await getGeneralGameRecommendations(gameList);

      // Map recommendations back to full game objects
      const gamesMap = new Map(uniqueGames.map(g => [g.appid, g]));
      const recommendedGames = recommendations
        .map(rec => gamesMap.get(rec.appid))
        .filter((g): g is typeof uniqueGames[0] => g !== undefined);

      return recommendedGames;
    }),
});

