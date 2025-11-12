"use client";

import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { GameSearch } from "~/components/game/GameSearch";
import { GameCard } from "~/components/game/GameCard";
import { GameFilters, FilterState } from "~/components/game/GameFilters";
import { Pagination } from "~/components/ui/Pagination";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    excludeNSFW: false,
    genres: [],
    freeOnly: false,
    onSaleOnly: false,
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            SteamLens
          </h1>
          <p className="text-xl text-gray-300">
            Discover Steam games and ask AI questions about them
          </p>
        </div>

        <GameSearch onSearch={setSearchQuery} />

        {searchQuery && (
          <div className="mt-8">
            <div className="mb-6">
              <GameFilters filters={filters} onFiltersChange={setFilters} />
            </div>
            <GameResults query={searchQuery} filters={filters} />
          </div>
        )}

        {!searchQuery && (
          <div className="mt-16 space-y-16">
            <div className="mb-6">
              <GameFilters filters={filters} onFiltersChange={setFilters} />
            </div>
            <TrendingGames filters={filters} />
            <NewReleases filters={filters} />
            <FreeGames filters={filters} />
            <GamesOnSale filters={filters} />
          </div>
        )}
      </div>
    </main>
  );
}

function GameResults({ query, filters }: { query: string; filters: FilterState }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
      }
    },
    { enabled: query.length > 0 }
  );

  // Reset to page 1 when query or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, filters]);

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

  const totalPages = Math.ceil(games.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGames = games.slice(startIndex, endIndex);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedGames.map((game) => (
          <GameCard key={game.appid} game={game} />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={games.length}
      />
    </>
  );
}

function TrendingGames({ filters }: { filters: FilterState }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: games, isLoading, error } = api.game.getTrendingGames.useQuery();

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p className="mt-4 text-gray-400">Loading trending games...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Error loading trending games: {error.message}</p>
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No trending games available at the moment.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(games.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGames = games.slice(startIndex, endIndex);

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Trending Games</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedGames.map((game) => (
          <GameCard key={game.appid} game={game} />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={games.length}
      />
    </div>
  );
}

function NewReleases({ filters }: { filters: FilterState }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: games, isLoading, error } = api.game.getNewReleases.useQuery({
    filters: {
      excludeNSFW: filters.excludeNSFW,
      maxPrice: filters.maxPrice,
      minPrice: filters.minPrice,
      genres: filters.genres,
      freeOnly: filters.freeOnly,
      onSaleOnly: filters.onSaleOnly,
    }
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p className="mt-4 text-gray-400">Loading new releases...</p>
      </div>
    );
  }

  if (error || !games || games.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(games.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGames = games.slice(startIndex, endIndex);

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">New Releases</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedGames.map((game) => (
          <GameCard key={game.appid} game={game} />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={games.length}
      />
    </div>
  );
}

function FreeGames({ filters }: { filters: FilterState }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: games, isLoading, error } = api.game.getFreeGames.useQuery({
    filters: {
      excludeNSFW: filters.excludeNSFW,
      genres: filters.genres,
    }
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p className="mt-4 text-gray-400">Loading free games...</p>
      </div>
    );
  }

  if (error || !games || games.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(games.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGames = games.slice(startIndex, endIndex);

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Free Games</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedGames.map((game) => (
          <GameCard key={game.appid} game={game} />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={games.length}
      />
    </div>
  );
}

function GamesOnSale({ filters }: { filters: FilterState }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: games, isLoading, error } = api.game.getGamesOnSale.useQuery({
    filters: {
      excludeNSFW: filters.excludeNSFW,
      maxPrice: filters.maxPrice,
      minPrice: filters.minPrice,
      genres: filters.genres,
    }
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p className="mt-4 text-gray-400">Loading games on sale...</p>
      </div>
    );
  }

  if (error || !games || games.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(games.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGames = games.slice(startIndex, endIndex);

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Games On Sale</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedGames.map((game) => (
          <GameCard key={game.appid} game={game} />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={games.length}
      />
    </div>
  );
}

