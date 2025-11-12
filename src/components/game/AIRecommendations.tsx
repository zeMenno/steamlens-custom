"use client";

import { api } from "~/utils/api";
import { GameCarousel } from "./GameCarousel";

export function AIRecommendations() {
  const { data: games, isLoading, error } = api.game.getAIRecommendedGames.useQuery();

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <h2 className="text-2xl font-bold text-white">AI-Powered Recommendations</h2>
        </div>
        <p className="text-gray-400">
          Discover games tailored for you based on trending titles and popular choices
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="ml-4 text-gray-400">Generating recommendations...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400">Error: {error.message}</p>
        </div>
      ) : games && games.length > 0 ? (
        <GameCarousel
          title="Recommended for You"
          games={games}
          isLoading={false}
          error={null}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">No recommendations available at the moment.</p>
        </div>
      )}
    </div>
  );
}

