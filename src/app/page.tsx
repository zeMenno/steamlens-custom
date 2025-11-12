"use client";

import { useState } from "react";
import { api } from "~/utils/api";
import { GameSearch } from "~/components/game/GameSearch";
import { GameCard } from "~/components/game/GameCard";
import { GameFilters, FilterState } from "~/components/game/GameFilters";
import { HeroSection } from "~/components/game/HeroSection";
import { GameCarousel } from "~/components/game/GameCarousel";
import { GenreBrowser } from "~/components/game/GenreBrowser";
import { PriceRangeDiscovery } from "~/components/game/PriceRangeDiscovery";
import { AIRecommendations } from "~/components/game/AIRecommendations";

type TabType = "trending" | "genres" | "ai" | "price";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    excludeNSFW: false,
    genres: [],
    freeOnly: false,
    onSaleOnly: false,
  });

  // If there's a search query, show search results
  if (searchQuery) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-white">SteamLens</h1>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {showSearch ? "Hide Search" : "Search"}
            </button>
          </div>

          {showSearch && (
            <div className="mb-8">
              <GameSearch onSearch={setSearchQuery} />
            </div>
          )}

          <div className="mb-6">
            <GameFilters filters={filters} onFiltersChange={setFilters} />
          </div>
          <GameResults query={searchQuery} filters={filters} />
        </div>
      </main>
    );
  }

  // Debug: Log to confirm new code is running
  if (typeof window !== "undefined") {
    console.log("New home page code loaded - Tabs:", activeTab);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">SteamLens</h1>
            <p className="text-gray-300">Discover Steam games and ask AI questions about them</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSearch(!showSearch);
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors cursor-pointer"
            type="button"
          >
            {showSearch ? "Hide Search" : "Search"}
          </button>
        </div>

        {/* Search Bar (when toggled) */}
        {showSearch && (
          <div className="mb-8">
            <GameSearch onSearch={setSearchQuery} />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-700">
          <div className="flex gap-4">
            <TabButton
              active={activeTab === "trending"}
              onClick={() => setActiveTab("trending")}
            >
              Trending
            </TabButton>
            <TabButton
              active={activeTab === "genres"}
              onClick={() => setActiveTab("genres")}
            >
              Genres
            </TabButton>
            <TabButton
              active={activeTab === "ai"}
              onClick={() => setActiveTab("ai")}
            >
              AI Recommendations
            </TabButton>
            <TabButton
              active={activeTab === "price"}
              onClick={() => setActiveTab("price")}
            >
              Price Ranges
            </TabButton>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "trending" && (
            <TrendingTab filters={filters} onFiltersChange={setFilters} />
          )}
          {activeTab === "genres" && <GenreBrowser />}
          {activeTab === "ai" && <AIRecommendations />}
          {activeTab === "price" && <PriceRangeDiscovery />}
        </div>
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`px-6 py-3 font-semibold transition-colors duration-200 border-b-2 cursor-pointer ${
        active
          ? "text-white border-blue-500"
          : "text-gray-400 border-transparent hover:text-white hover:border-gray-600"
      }`}
      type="button"
    >
      {children}
    </button>
  );
}

function GameResults({ query, filters }: { query: string; filters: FilterState }) {
  const { data: games, isLoading, error } = api.game.searchGames.useQuery(
    {
      query,
      filters: {
        excludeNSFW: filters.excludeNSFW,
        maxPrice: filters.maxPrice,
        minPrice: filters.minPrice,
        genres: filters.genres,
        freeOnly: filters.freeOnly,
        onSaleOnly: filters.onSaleOnly,
      },
    },
    { enabled: query.length > 0 }
  );

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p className="mt-4 text-gray-400">Searching games...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Error: {error.message}</p>
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No games found. Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {games.map((game) => (
        <GameCard key={game.appid} game={game} />
      ))}
    </div>
  );
}

function TrendingTab({
  filters,
  onFiltersChange,
}: {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}) {
  const { data: trendingGames, isLoading: trendingLoading } =
    api.game.getTrendingGames.useQuery();
  const { data: newReleases, isLoading: newReleasesLoading } =
    api.game.getNewReleases.useQuery({
      filters: {
        excludeNSFW: filters.excludeNSFW,
        maxPrice: filters.maxPrice,
        minPrice: filters.minPrice,
        genres: filters.genres,
        freeOnly: filters.freeOnly,
        onSaleOnly: filters.onSaleOnly,
      },
    });
  const { data: freeGames, isLoading: freeGamesLoading } =
    api.game.getFreeGames.useQuery({
      filters: {
        excludeNSFW: filters.excludeNSFW,
        genres: filters.genres,
      },
    });
  const { data: gamesOnSale, isLoading: gamesOnSaleLoading } =
    api.game.getGamesOnSale.useQuery({
      filters: {
        excludeNSFW: filters.excludeNSFW,
        maxPrice: filters.maxPrice,
        minPrice: filters.minPrice,
        genres: filters.genres,
      },
    });

  return (
    <div>
      {/* Filters */}
      <div className="mb-8">
        <GameFilters filters={filters} onFiltersChange={onFiltersChange} />
      </div>

      {/* Hero Section with Trending Games */}
      {trendingGames && trendingGames.length > 0 && (
        <HeroSection games={trendingGames.slice(0, 5)} isLoading={trendingLoading} />
      )}

      {/* Horizontal Carousels */}
      <div className="space-y-8">
        {trendingGames && trendingGames.length > 0 && (
          <GameCarousel
            title="Trending Now"
            games={trendingGames}
            isLoading={trendingLoading}
            error={null}
          />
        )}

        {newReleases && newReleases.length > 0 && (
          <GameCarousel
            title="New Releases"
            games={newReleases}
            isLoading={newReleasesLoading}
            error={null}
          />
        )}

        {freeGames && freeGames.length > 0 && (
          <GameCarousel
            title="Free Games"
            games={freeGames}
            isLoading={freeGamesLoading}
            error={null}
          />
        )}

        {gamesOnSale && gamesOnSale.length > 0 && (
          <GameCarousel
            title="On Sale"
            games={gamesOnSale}
            isLoading={gamesOnSaleLoading}
            error={null}
          />
        )}
      </div>
    </div>
  );
}
