"use client";

import Link from "next/link";
import { api } from "~/utils/api";

interface SimilarGamesContentProps {
  appId: number;
}

export function SimilarGamesContent({ appId }: SimilarGamesContentProps) {
  const { data: similarGames, isLoading, error } = api.ai.getSimilarGames.useQuery(
    { appId },
    { enabled: !!appId }
  );

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p className="mt-2 text-gray-400">Finding similar games...</p>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-400">Error: {error.message}</p>
    );
  }

  if (!similarGames || similarGames.length === 0) {
    return (
      <p className="text-gray-400">No similar games found.</p>
    );
  }

  return (
    <div className="space-y-6">
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
  );
}

