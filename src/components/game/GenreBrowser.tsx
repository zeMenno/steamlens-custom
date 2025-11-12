"use client";

import { useState } from "react";
import { api } from "~/utils/api";
import { GameCarousel } from "./GameCarousel";

const POPULAR_GENRES = [
  "Action",
  "Adventure",
  "RPG",
  "Strategy",
  "Simulation",
  "Indie",
  "Casual",
  "Racing",
  "Sports",
  "Puzzle",
  "Horror",
  "Shooter",
  "Platformer",
  "Fighting",
  "MMO",
];

export function GenreBrowser() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(["Action", "RPG", "Strategy"]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  return (
    <div>
      {/* Genre Selector */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Browse by Genre</h2>
        <div className="flex flex-wrap gap-3">
          {POPULAR_GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                selectedGenres.includes(genre)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Genre Carousels */}
      <div className="space-y-8">
        {selectedGenres.map((genre) => (
          <GenreCarousel key={genre} genre={genre} />
        ))}
      </div>
    </div>
  );
}

function GenreCarousel({ genre }: { genre: string }) {
  const { data: games, isLoading, error } = api.game.getGamesByGenre.useQuery({
    genre,
  });

  return (
    <GameCarousel
      title={genre}
      games={games || []}
      isLoading={isLoading}
      error={error?.message || null}
    />
  );
}

