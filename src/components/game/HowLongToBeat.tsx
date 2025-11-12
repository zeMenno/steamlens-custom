"use client";

import { api } from "~/utils/api";

interface HowLongToBeatProps {
  gameName: string;
  appId?: number;
}

export function HowLongToBeat({ gameName, appId }: HowLongToBeatProps) {
  const { data: hltbData, isLoading, error } = api.game.getHowLongToBeat.useQuery(
    { gameName, appId },
    { enabled: !!gameName }
  );

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        <p className="mt-2 text-gray-400 text-xs">Loading playtime data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-2">
        <p className="text-red-400 text-xs">Error loading playtime data</p>
      </div>
    );
  }

  if (!hltbData) {
    return (
      <div className="text-center py-2">
        <p className="text-gray-500 text-xs">Game not found on HowLongToBeat</p>
      </div>
    );
  }

  const formatTime = (hours?: number): string => {
    if (!hours) return "N/A";
    if (hours < 1) return "< 1h";
    return `${hours.toFixed(1)}h`;
  };

  return (
    <div className="space-y-3">
      {hltbData.gameplayMain && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Main Story</span>
            <span className="text-sm font-bold text-white">{formatTime(hltbData.gameplayMain)}</span>
          </div>
        </div>
      )}
      {hltbData.gameplayMainExtra && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Main + Extras</span>
            <span className="text-sm font-bold text-white">{formatTime(hltbData.gameplayMainExtra)}</span>
          </div>
        </div>
      )}
      {hltbData.gameplayCompletionist && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Completionist</span>
            <span className="text-sm font-bold text-white">{formatTime(hltbData.gameplayCompletionist)}</span>
          </div>
        </div>
      )}
      <a
        href={`https://howlongtobeat.com/game/${hltbData.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline text-xs mt-2 block"
      >
        View on HowLongToBeat →
      </a>
    </div>
  );
}

