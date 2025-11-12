"use client";

import Image from "next/image";
import { MediaCarousel } from "./MediaCarousel";
import { AIChatContent } from "../ai/AIChatContent";
import { SimilarGamesContent } from "../ai/SimilarGamesContent";
import { CollapsibleSection } from "../ui/CollapsibleSection";
import { HowLongToBeat } from "./HowLongToBeat";

interface GameDetailsProps {
  appId: number;
  game: {
    name: string;
    short_description: string;
    detailed_description?: string;
    about_the_game?: string;
    header_image: string;
    steam_appid: number;
    developers: string[];
    publishers: string[];
    release_date: {
      date: string;
      coming_soon: boolean;
    };
    price_overview?: {
      final: number;
      initial: number;
      discount_percent: number;
      currency: string;
    };
    is_free: boolean;
    genres: Array<{ description: string }>;
    platforms: {
      windows: boolean;
      mac: boolean;
      linux: boolean;
    };
    screenshots?: Array<{ id: number; path_thumbnail: string; path_full: string }>;
    movies?: Array<{ id: number; name: string; thumbnail: string; webm: { [key: string]: string } }>;
    website?: string;
    metacritic?: {
      score: number;
      url: string;
    };
  };
}

export function GameDetails({ appId, game }: GameDetailsProps) {
  const isOnSale = game.price_overview && game.price_overview.discount_percent > 0;
  const discountPercent = game.price_overview?.discount_percent || 0;
  const originalPrice = game.price_overview?.initial 
    ? `$${(game.price_overview.initial / 100).toFixed(2)}`
    : null;
  const finalPrice = game.price_overview?.final 
    ? `$${(game.price_overview.final / 100).toFixed(2)}`
    : null;
  
  const price = game.is_free
    ? "Free"
    : finalPrice || "Price not available";

  const steamStoreUrl = `https://store.steampowered.com/app/${game.steam_appid}`;
  const fullDescription = game.detailed_description || game.about_the_game || game.short_description;

  return (
    <div className="space-y-6">
      {/* Hero Section with Header Image and Info */}
      <div className="relative w-full h-96 bg-gray-900 rounded-xl overflow-hidden">
        <Image
          src={game.header_image}
          alt={game.name}
          fill
          className="object-cover opacity-50"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h1 className="text-5xl font-bold text-white mb-4">{game.name}</h1>
          <p className="text-xl text-gray-200 mb-6 max-w-3xl">
            {game.short_description}
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <a
              href={steamStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-[#1b2838] hover:bg-[#2a475e] text-white font-bold rounded transition-colors duration-200 border-2 border-[#66c0f4] hover:border-[#4a9bc4]"
            >
              Buy on Steam
            </a>
            <div className="flex items-center gap-3">
              {isOnSale && (
                <div className="px-3 py-1.5 bg-green-600 text-white font-bold rounded-lg text-lg">
                  -{discountPercent}%
                </div>
              )}
              <div className="flex flex-col">
                {isOnSale && originalPrice && (
                  <span className="text-gray-400 text-lg line-through">
                    {originalPrice}
                  </span>
                )}
                <span className={`text-3xl font-bold ${isOnSale ? "text-green-400" : "text-white"}`}>
                  {price}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Media (3/4 width) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Media Carousel */}
          {(game.screenshots && game.screenshots.length > 0) || (game.movies && game.movies.length > 0) ? (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Screenshots & Videos</h2>
              <MediaCarousel
                screenshots={game.screenshots}
                movies={game.movies}
                gameName={game.name}
              />
            </div>
          ) : null}

          {/* Game Description */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">About This Game</h2>
            <div
              className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: fullDescription }}
            />
          </div>
        </div>

        {/* Right Column - Quick Info + AI Sections (1/4 width, sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Quick Info Panel */}
            <CollapsibleSection 
              title="Quick Info"
              defaultOpen={true}
              collapsedContent={
                <div className="flex items-center gap-2">
                  {isOnSale && (
                    <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
                      -{discountPercent}%
                    </span>
                  )}
                  <span className={`font-bold text-sm ${isOnSale ? "text-green-400" : "text-white"}`}>
                    {price}
                  </span>
                </div>
              }
            >
              <div className="space-y-5">
                {/* Metacritic Score */}
                {game.metacritic && (
                  <div>
                    <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Metacritic</div>
                    <a
                      href={game.metacritic.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 group"
                    >
                      <div
                        className={`px-3 py-1.5 rounded font-bold ${
                          game.metacritic.score >= 75
                            ? "bg-green-600 text-white"
                            : game.metacritic.score >= 50
                            ? "bg-yellow-500 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {game.metacritic.score}
                      </div>
                      <span className="text-blue-400 group-hover:text-blue-300 text-xs underline">
                        View
                      </span>
                    </a>
                  </div>
                )}

                {/* Price */}
                <div>
                  <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Price</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {isOnSale && (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
                        -{discountPercent}%
                      </span>
                    )}
                    <div className="flex flex-col">
                      {isOnSale && originalPrice && (
                        <span className="text-gray-400 text-xs line-through">
                          {originalPrice}
                        </span>
                      )}
                      <span className={`font-bold ${isOnSale ? "text-green-400" : "text-white"}`}>
                        {price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Release Date */}
                <div>
                  <div className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Release Date</div>
                  <p className="text-white text-sm">
                    {game.release_date.coming_soon
                      ? "Coming Soon"
                      : game.release_date.date}
                  </p>
                </div>

                {/* Developers */}
                <div>
                  <div className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Developers</div>
                  <p className="text-white text-sm">{game.developers.join(", ") || "N/A"}</p>
                </div>

                {/* Publishers */}
                <div>
                  <div className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Publishers</div>
                  <p className="text-white text-sm">{game.publishers.join(", ") || "N/A"}</p>
                </div>

                {/* Genres */}
                <div>
                  <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Genres</div>
                  <div className="flex flex-wrap gap-1.5">
                    {game.genres.map((genre, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-600/80 text-white text-xs rounded"
                      >
                        {genre.description}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Platforms */}
                <div>
                  <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Platforms</div>
                  <div className="flex flex-col gap-1.5">
                    {game.platforms.windows && (
                      <span className="text-white text-sm">🪟 Windows</span>
                    )}
                    {game.platforms.mac && <span className="text-white text-sm">🍎 Mac</span>}
                    {game.platforms.linux && (
                      <span className="text-white text-sm">🐧 Linux</span>
                    )}
                  </div>
                </div>

                {/* Website Link */}
                {game.website && (
                  <div>
                    <a
                      href={game.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline text-sm"
                    >
                      Official Website →
                    </a>
                  </div>
                )}

                {/* How Long To Beat */}
                <div>
                  <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">How Long To Beat</div>
                  <HowLongToBeat gameName={game.name} appId={appId} />
                </div>
              </div>
            </CollapsibleSection>

            {/* AI Chat */}
            <CollapsibleSection
              title="Ask AI About This Game"
              defaultOpen={true}
              icon={
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
              }
            >
              <AIChatContent appId={appId} />
            </CollapsibleSection>

            {/* Similar Games */}
            <CollapsibleSection
              title="AI-Suggested Similar Games"
              defaultOpen={true}
              icon={
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
              }
            >
              <SimilarGamesContent appId={appId} />
            </CollapsibleSection>
          </div>
        </div>
      </div>
    </div>
  );
}
