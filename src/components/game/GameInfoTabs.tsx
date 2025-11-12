"use client";

import { useState } from "react";
import { SystemRequirements } from "./SystemRequirements";

interface GameInfoTabsProps {
  description: string;
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

type TabType = "about" | "requirements";

export function GameInfoTabs({
  description,
  pcRequirements,
  macRequirements,
  linuxRequirements,
  platforms,
}: GameInfoTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("about");

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-gray-700">
        <div className="flex gap-2 px-6 pt-4">
          <button
            onClick={() => setActiveTab("about")}
            className={`px-6 py-3 font-semibold transition-colors duration-200 border-b-2 cursor-pointer ${
              activeTab === "about"
                ? "text-white border-blue-500"
                : "text-gray-400 border-transparent hover:text-white hover:border-gray-600"
            }`}
            type="button"
          >
            About This Game
          </button>
          <button
            onClick={() => setActiveTab("requirements")}
            className={`px-6 py-3 font-semibold transition-colors duration-200 border-b-2 cursor-pointer ${
              activeTab === "requirements"
                ? "text-white border-blue-500"
                : "text-gray-400 border-transparent hover:text-white hover:border-gray-600"
            }`}
            type="button"
          >
            System Requirements
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "about" && (
          <div
            className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        {activeTab === "requirements" && (
          <SystemRequirements
            pcRequirements={pcRequirements}
            macRequirements={macRequirements}
            linuxRequirements={linuxRequirements}
            platforms={platforms}
          />
        )}
      </div>
    </div>
  );
}

