import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { askQuestionAboutGame, getSimilarGames } from "../services/groq";
import { getSteamGameDetails, searchSteamGames } from "../services/steam";

export const aiRouter = createTRPCRouter({
  askQuestion: publicProcedure
    .input(
      z.object({
        appId: z.number(),
        question: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const gameDetails = await getSteamGameDetails(input.appId);
      if (!gameDetails) {
        throw new Error("Game not found");
      }

      const gameData = {
        name: gameDetails.name,
        description: gameDetails.short_description || gameDetails.about_the_game || "",
        genres: gameDetails.genres?.map((g) => g.description) || [],
        developers: gameDetails.developers || [],
        releaseDate: gameDetails.release_date?.date || "Unknown",
        price: gameDetails.price_overview
          ? `$${(gameDetails.price_overview.final / 100).toFixed(2)}`
          : gameDetails.is_free
          ? "Free"
          : undefined,
      };

      const answer = await askQuestionAboutGame(input.question, gameData);
      return answer;
    }),

  getSimilarGames: publicProcedure
    .input(z.object({ appId: z.number() }))
    .query(async ({ input }) => {
      const gameDetails = await getSteamGameDetails(input.appId);
      if (!gameDetails) {
        throw new Error("Game not found");
      }

      // Get a list of popular games for context (using a broad search)
      // Try multiple genre searches to get a better pool of candidates
      const genreSearches = gameDetails.genres?.slice(0, 3).map(g => g.description) || ["game"];
      const allGames: Array<{ appid: number; name: string }> = [];
      
      for (const genre of genreSearches) {
        try {
          const games = await searchSteamGames(genre);
          allGames.push(...games);
        } catch (e) {
          // Continue with next genre
        }
      }
      
      // Remove duplicates and filter out the current game
      const uniqueGames = Array.from(
        new Map(allGames.map(game => [game.appid, game])).values()
      )
      .filter(game => game.appid !== input.appId) // Exclude the current game
      .slice(0, 100);

      const gameData = {
        name: gameDetails.name,
        description: gameDetails.short_description || "",
        detailedDescription: gameDetails.detailed_description || gameDetails.about_the_game || "",
        genres: gameDetails.genres?.map((g) => g.description) || [],
        categories: gameDetails.categories?.map((c) => c.description) || [],
        developers: gameDetails.developers || [],
        publishers: gameDetails.publishers || [],
        releaseDate: gameDetails.release_date?.date || undefined,
        price: gameDetails.price_overview
          ? `$${(gameDetails.price_overview.final / 100).toFixed(2)}`
          : gameDetails.is_free
          ? "Free"
          : undefined,
        isFree: gameDetails.is_free,
        metacriticScore: gameDetails.metacritic?.score,
        platforms: [
          gameDetails.platforms.windows ? "Windows" : "",
          gameDetails.platforms.mac ? "Mac" : "",
          gameDetails.platforms.linux ? "Linux" : "",
        ].filter(Boolean),
      };

      const similarGames = await getSimilarGames(gameData, uniqueGames);
      return similarGames;
    }),
});

