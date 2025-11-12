"use client";

import { useState } from "react";

interface SystemRequirementsProps {
  pcRequirements?: {
    minimum?: string;
    recommended?: string;
  };
  macRequirements?: {
    minimum?: string;
    recommended?: string;
  };
  linuxRequirements?: {
    minimum?: string;
    recommended?: string;
  };
  platforms: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
}

type Platform = "windows" | "mac" | "linux";

export function SystemRequirements({
  pcRequirements,
  macRequirements,
  linuxRequirements,
  platforms,
}: SystemRequirementsProps) {
  const [activePlatform, setActivePlatform] = useState<Platform>(() => {
    // Default to first available platform
    if (platforms.windows) return "windows";
    if (platforms.mac) return "mac";
    if (platforms.linux) return "linux";
    return "windows";
  });

  const getRequirements = (platform: Platform) => {
    switch (platform) {
      case "windows":
        return pcRequirements;
      case "mac":
        return macRequirements;
      case "linux":
        return linuxRequirements;
    }
  };

  const formatRequirements = (requirements?: string): string[] => {
    if (!requirements) return [];
    
    // Split by common delimiters and clean up
    return requirements
      .split(/<br>|<br\/>|\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.match(/^<[^>]+>$/))
      .map((line) => {
        // Remove HTML tags
        return line.replace(/<[^>]+>/g, "").trim();
      })
      .filter((line) => line.length > 0);
  };

  const requirements = getRequirements(activePlatform);
  const minimumReqs = formatRequirements(requirements?.minimum);
  const recommendedReqs = formatRequirements(requirements?.recommended);

  const hasAnyRequirements = 
    pcRequirements?.minimum || 
    pcRequirements?.recommended ||
    macRequirements?.minimum ||
    macRequirements?.recommended ||
    linuxRequirements?.minimum ||
    linuxRequirements?.recommended;

  if (!hasAnyRequirements) {
    return (
      <div>
        <p className="text-gray-400">System requirements are not available for this game.</p>
      </div>
    );
  }

  return (
    <div>

      {/* Platform Tabs */}
      <div className="mb-6 border-b border-gray-700">
        <div className="flex gap-2">
          {platforms.windows && (
            <button
              onClick={() => setActivePlatform("windows")}
              className={`px-4 py-2 font-semibold transition-colors duration-200 border-b-2 cursor-pointer ${
                activePlatform === "windows"
                  ? "text-white border-blue-500"
                  : "text-gray-400 border-transparent hover:text-white hover:border-gray-600"
              }`}
              type="button"
            >
              🪟 Windows
            </button>
          )}
          {platforms.mac && (
            <button
              onClick={() => setActivePlatform("mac")}
              className={`px-4 py-2 font-semibold transition-colors duration-200 border-b-2 cursor-pointer ${
                activePlatform === "mac"
                  ? "text-white border-blue-500"
                  : "text-gray-400 border-transparent hover:text-white hover:border-gray-600"
              }`}
              type="button"
            >
              🍎 Mac
            </button>
          )}
          {platforms.linux && (
            <button
              onClick={() => setActivePlatform("linux")}
              className={`px-4 py-2 font-semibold transition-colors duration-200 border-b-2 cursor-pointer ${
                activePlatform === "linux"
                  ? "text-white border-blue-500"
                  : "text-gray-400 border-transparent hover:text-white hover:border-gray-600"
              }`}
              type="button"
            >
              🐧 Linux
            </button>
          )}
        </div>
      </div>

      {/* Requirements Content */}
      <div className="space-y-6">
        {/* Minimum Requirements */}
        {minimumReqs.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              Minimum Requirements
            </h3>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <ul className="space-y-2">
                {minimumReqs.map((req, index) => (
                  <li key={index} className="text-gray-300 text-sm leading-relaxed">
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Recommended Requirements */}
        {recommendedReqs.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Recommended Requirements
            </h3>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <ul className="space-y-2">
                {recommendedReqs.map((req, index) => (
                  <li key={index} className="text-gray-300 text-sm leading-relaxed">
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {minimumReqs.length === 0 && recommendedReqs.length === 0 && (
          <p className="text-gray-400 text-sm">
            System requirements are not available for {activePlatform === "windows" ? "Windows" : activePlatform === "mac" ? "Mac" : "Linux"}.
          </p>
        )}
      </div>
    </div>
  );
}

