"use client";

import { useState } from "react";

export interface FilterState {
  excludeNSFW: boolean;
  maxPrice?: number;
  minPrice?: number;
  genres: string[];
  freeOnly: boolean;
  onSaleOnly: boolean;
}

interface GameFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const POPULAR_GENRES = [
  "Action", "Adventure", "RPG", "Strategy", "Simulation",
  "Indie", "Casual", "Racing", "Sports", "Puzzle",
  "Horror", "Shooter", "Platformer", "Fighting", "MMO"
];

export function GameFilters({ filters, onFiltersChange }: GameFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleGenre = (genre: string) => {
    const newGenres = filters.genres.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...filters.genres, genre];
    updateFilter("genres", newGenres);
  };

  const clearFilters = () => {
    onFiltersChange({
      excludeNSFW: false,
      genres: [],
      freeOnly: false,
      onSaleOnly: false,
    });
  };

  const hasActiveFilters = 
    filters.excludeNSFW ||
    filters.freeOnly ||
    filters.onSaleOnly ||
    filters.genres.length > 0 ||
    filters.maxPrice !== undefined ||
    filters.minPrice !== undefined;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors duration-200"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white">Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
              {[
                filters.excludeNSFW && "NSFW",
                filters.freeOnly && "Free",
                filters.onSaleOnly && "Sale",
                filters.genres.length > 0 && `${filters.genres.length} genres`,
              ].filter(Boolean).length} active
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
          {/* NSFW Filter */}
          <div className="flex items-center justify-between">
            <label className="text-white font-medium">Exclude NSFW Content</label>
            <button
              onClick={() => updateFilter("excludeNSFW", !filters.excludeNSFW)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                filters.excludeNSFW ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  filters.excludeNSFW ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Quick Filters */}
          <div className="space-y-2">
            <div className="text-white font-medium text-sm">Quick Filters</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter("freeOnly", !filters.freeOnly)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filters.freeOnly
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Free Only
              </button>
              <button
                onClick={() => updateFilter("onSaleOnly", !filters.onSaleOnly)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filters.onSaleOnly
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                On Sale
              </button>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <div className="text-white font-medium text-sm">Price Range</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Min Price ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.minPrice || ""}
                  onChange={(e) =>
                    updateFilter("minPrice", e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Max Price ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.maxPrice || ""}
                  onChange={(e) =>
                    updateFilter("maxPrice", e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  placeholder="No limit"
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Genres */}
          <div className="space-y-2">
            <div className="text-white font-medium text-sm">Genres</div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filters.genres.includes(genre)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

