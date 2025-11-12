import Groq from "groq-sdk";

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set in environment variables");
  }
  return new Groq({
    apiKey: apiKey,
  });
}

export async function askQuestionAboutGame(
  question: string,
  gameData: {
    name: string;
    description: string;
    genres: string[];
    developers: string[];
    releaseDate: string;
    price?: string;
    reviews?: string;
  }
): Promise<string> {
  try {
    const prompt = `You are a helpful assistant that answers questions about video games on Steam.

Game Information:
- Name: ${gameData.name}
- Description: ${gameData.description}
- Genres: ${gameData.genres.join(", ")}
- Developers: ${gameData.developers.join(", ")}
- Release Date: ${gameData.releaseDate}
${gameData.price ? `- Price: ${gameData.price}` : ""}
${gameData.reviews ? `- Reviews: ${gameData.reviews}` : ""}

User Question: ${question}

Please provide a helpful and accurate answer based on the game information provided. If the question cannot be answered with the given information, say so politely.`;

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides information about video games on Steam.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
  } catch (error: any) {
    console.error("Error calling Groq API:", error);
    const errorMessage = error?.message || error?.toString() || "Unknown error";
    console.error("Groq API Error Details:", {
      message: errorMessage,
      status: error?.status,
      statusText: error?.statusText,
      response: error?.response,
    });
    throw new Error(`Failed to get AI response: ${errorMessage}`);
  }
}

export async function getSimilarGames(
  gameData: {
    name: string;
    description: string;
    detailedDescription?: string;
    genres: string[];
    developers: string[];
    publishers?: string[];
    releaseDate?: string;
    price?: string;
    isFree?: boolean;
    metacriticScore?: number;
    platforms?: string[];
    categories?: string[];
  },
  availableGames: Array<{ appid: number; name: string }>
): Promise<Array<{ appid: number; name: string; reason: string }>> {
  try {
    const gamesList = availableGames
      .slice(0, 50) // Limit to first 50 for context
      .map((g) => `${g.appid}: ${g.name}`)
      .join("\n");

    // Build comprehensive game information
    const gameInfo = [
      `Name: ${gameData.name}`,
      `Description: ${gameData.description}`,
      gameData.detailedDescription ? `Detailed Description: ${gameData.detailedDescription.substring(0, 500)}...` : "",
      `Genres: ${gameData.genres.join(", ")}`,
      gameData.categories && gameData.categories.length > 0 ? `Categories: ${gameData.categories.join(", ")}` : "",
      `Developers: ${gameData.developers.join(", ")}`,
      gameData.publishers && gameData.publishers.length > 0 ? `Publishers: ${gameData.publishers.join(", ")}` : "",
      gameData.releaseDate ? `Release Date: ${gameData.releaseDate}` : "",
      gameData.price ? `Price: ${gameData.price}` : gameData.isFree ? "Price: Free" : "",
      gameData.metacriticScore ? `Metacritic Score: ${gameData.metacriticScore}/100` : "",
      gameData.platforms && gameData.platforms.length > 0 ? `Platforms: ${gameData.platforms.join(", ")}` : "",
    ].filter(Boolean).join("\n");

    const prompt = `You are an expert game recommendation assistant. Analyze the following game in detail and suggest 5 truly similar games from the provided list.

IMPORTANT: Do NOT suggest the game "${gameData.name}" - it is the game the user is already viewing. Only suggest OTHER games from the list.

Current Game Information:
${gameInfo}

Consider these factors when making recommendations:
- Gameplay mechanics and style
- Genre and sub-genres
- Visual style and art direction
- Story themes and narrative style
- Target audience
- Game length and content type
- Similar developers/publishers (if relevant)
- Release era and platform availability
- Overall quality (Metacritic score if available)

Available Games (format: appid: name):
${gamesList}

Please return exactly 5 game recommendations in the following JSON format:
[
  {"appid": 123, "name": "Game Name", "reason": "Detailed explanation of why it's similar, considering gameplay, genre, style, and other relevant factors"},
  ...
]

Only use games from the provided list. Do NOT suggest "${gameData.name}". Return only valid JSON, no additional text.`;

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a game recommendation assistant. Always return valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.6,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content || "{}";
    
    try {
      const parsed = JSON.parse(response);
      // Handle both array and object with array property
      const recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations || parsed.games || [];
      
      // Create a map of available games by appid and name for lookup
      const gamesById = new Map(availableGames.map(g => [g.appid, g]));
      const gamesByName = new Map(
        availableGames.map(g => [g.name.toLowerCase().trim(), g])
      );
      
      // Validate and match recommendations to actual games
      const validRecommendations = recommendations
        .slice(0, 10) // Get more to filter down
        .map((rec: any) => {
          const appid = typeof rec.appid === 'number' ? rec.appid : parseInt(rec.appid);
          const name = (rec.name || rec.title || "").trim();
          
          // Try to find the game by appid first
          let matchedGame = gamesById.get(appid);
          
          // If not found by ID, try to match by name
          if (!matchedGame && name) {
            matchedGame = gamesByName.get(name.toLowerCase());
          }
          
          return matchedGame ? {
            appid: matchedGame.appid,
            name: matchedGame.name,
            reason: rec.reason || rec.explanation || "Similar game",
          } : null;
        })
        .filter((rec: any): rec is { appid: number; name: string; reason: string } => 
          rec !== null && 
          rec.appid && 
          rec.name && 
          rec.name.toLowerCase() !== gameData.name.toLowerCase()
        );
      
      // Remove duplicates and return top 5
      const recMap = new Map<number, { appid: number; name: string; reason: string }>();
      validRecommendations.forEach((r: { appid: number; name: string; reason: string }) => {
        recMap.set(r.appid, r);
      });
      const uniqueRecs = Array.from(recMap.values());
      
      return uniqueRecs.slice(0, 5);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // Fallback: return games from similar genres
      return availableGames
        .filter((g) => 
          gameData.genres.some((genre) => 
            g.name.toLowerCase().includes(genre.toLowerCase())
          )
        )
        .slice(0, 5)
        .map((g) => ({ ...g, reason: "Similar genre" }));
    }
  } catch (error: any) {
    console.error("Error getting similar games from Groq:", error);
    const errorMessage = error?.message || error?.toString() || "Unknown error";
    console.error("Groq API Error Details (Similar Games):", {
      message: errorMessage,
      status: error?.status,
      statusText: error?.statusText,
      response: error?.response,
    });
    // Fallback to genre-based matching
    return availableGames
      .filter((g) => 
        gameData.genres.some((genre) => 
          g.name.toLowerCase().includes(genre.toLowerCase())
        )
      )
      .slice(0, 5)
      .map((g) => ({ ...g, reason: "Similar genre" }));
  }
}

