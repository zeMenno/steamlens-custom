"use client";

import { useState } from "react";
import { api } from "~/utils/api";
import { GameCarousel } from "./GameCarousel";

interface PriceRange {
  label: string;
  minPrice?: number;
  maxPrice?: number;
}

const PRICE_RANGES: PriceRange[] = [
  { label: "Free", minPrice: 0, maxPrice: 0 },
  { label: "$0 - $10", minPrice: 0.01, maxPrice: 10 },
  { label: "$10 - $20", minPrice: 10.01, maxPrice: 20 },
  { label: "$20 - $50", minPrice: 20.01, maxPrice: 50 },
  { label: "$50+", minPrice: 50.01 },
];

export function PriceRangeDiscovery() {
  const [selectedRanges, setSelectedRanges] = useState<string[]>([
    "Free",
    "$0 - $10",
    "$10 - $20",
  ]);

  const toggleRange = (rangeLabel: string) => {
    setSelectedRanges((prev) =>
      prev.includes(rangeLabel)
        ? prev.filter((r) => r !== rangeLabel)
        : [...prev, rangeLabel]
    );
  };

  return (
    <div>
      {/* Price Range Selector */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Browse by Price</h2>
        <div className="flex flex-wrap gap-3">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.label}
              onClick={() => toggleRange(range.label)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                selectedRanges.includes(range.label)
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Carousels */}
      <div className="space-y-8">
        {selectedRanges.map((rangeLabel) => {
          const range = PRICE_RANGES.find((r) => r.label === rangeLabel);
          if (!range) return null;
          return (
            <PriceRangeCarousel
              key={rangeLabel}
              label={rangeLabel}
              minPrice={range.minPrice}
              maxPrice={range.maxPrice}
            />
          );
        })}
      </div>
    </div>
  );
}

function PriceRangeCarousel({
  label,
  minPrice,
  maxPrice,
}: {
  label: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const { data: games, isLoading, error } = api.game.getGamesByPriceRange.useQuery({
    minPrice,
    maxPrice,
  });

  return (
    <GameCarousel
      title={label}
      games={games || []}
      isLoading={isLoading}
      error={error?.message || null}
    />
  );
}

