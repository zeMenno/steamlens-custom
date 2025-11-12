"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "~/utils/api";
import { GameDetails } from "~/components/game/GameDetails";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const appId = Number(params.id);

  const { data: game, isLoading, error } = api.game.getGameDetails.useQuery(
    { appId },
    { enabled: !isNaN(appId) }
  );

  if (isNaN(appId)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl">Invalid game ID</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="mt-4 text-gray-400">Loading game details...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl">Error: {error?.message || "Game not found"}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => router.push("/")}
          className="mb-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 border border-gray-700"
        >
          ← Back to Search
        </button>

        {/* Game Details */}
        <GameDetails appId={appId} game={game} />
      </div>
    </div>
  );
}

