"use client";

import Link from "next/link";
import { api } from "~/utils/api";

interface SimilarGamesProps {
  appId: number;
}

export function SimilarGames({ appId }: SimilarGamesProps) {
  const { data: similarGames, isLoading, error } = api.ai.getSimilarGames.useQuery(
    { appId },
    { enabled: !!appId }
  );

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <h2 className="text-xl font-bold text-white">Similar Games</h2>
        </div>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-2 text-gray-400">Finding similar games...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <h2 className="text-xl font-bold text-white">Similar Games</h2>
        </div>
        <p className="text-red-400">Error: {error.message}</p>
      </div>
    );
  }

  if (!similarGames || similarGames.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <h2 className="text-xl font-bold text-white">Similar Games</h2>
        </div>
        <p className="text-gray-400">No similar games found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">AI</span>
        </div>
        <h2 className="text-xl font-bold text-white">AI-Suggested Similar Games</h2>
      </div>
      <div className="space-y-5">
        {similarGames.map((game) => (
          <Link key={game.appid} href={`/game/${game.appid}`}>
            <div className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 transition-all duration-200 border border-gray-600 hover:border-blue-500 cursor-pointer">
              <h3 className="text-base font-semibold text-white mb-2">
                {game.name}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">{game.reason}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

