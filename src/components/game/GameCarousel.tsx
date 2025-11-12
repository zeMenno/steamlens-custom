"use client";

import { useRef, useState, useEffect } from "react";
import { GameCard } from "./GameCard";

interface GameCarouselProps {
  title: string;
  games: Array<{
    appid: number;
    name: string;
    image?: string;
    price?: string;
    originalPrice?: string;
    discountPercent?: number;
    isFree?: boolean;
  }>;
  isLoading?: boolean;
  error?: string | null;
}

export function GameCarousel({ title, games, isLoading, error }: GameCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.75;
    const newScrollLeft =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Check initial scroll state and handle window resize
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    };

    // Check initial state
    checkScrollState();

    // Handle window resize
    window.addEventListener("resize", checkScrollState);
    return () => window.removeEventListener("resize", checkScrollState);
  }, [games]);

  if (isLoading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <div className="text-center py-8">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!games || games.length === 0) {
    return null;
  }

  return (
    <div className="mb-12 relative group">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              scroll("left");
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-gradient-to-r from-gray-900/90 to-transparent hover:from-gray-800/90 flex items-center justify-center transition-opacity duration-200 rounded-r-lg cursor-pointer"
            aria-label="Scroll left"
            type="button"
          >
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {games.map((game) => (
            <div
              key={game.appid}
              className="flex-shrink-0 w-64"
            >
              <GameCard game={game} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              scroll("right");
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-gradient-to-l from-gray-900/90 to-transparent hover:from-gray-800/90 flex items-center justify-center transition-opacity duration-200 rounded-l-lg cursor-pointer"
            aria-label="Scroll right"
            type="button"
          >
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

