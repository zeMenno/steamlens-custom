"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface HeroSectionProps {
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
}

export function HeroSection({ games, isLoading }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate featured games every 5 seconds
  useEffect(() => {
    if (games.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % games.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [games.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? games.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % games.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[70vh] bg-gray-900 flex items-center justify-center mb-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!games || games.length === 0) {
    return null;
  }

  const currentGame = games[currentIndex];
  const backgroundImage = currentGame.image || "";

  return (
    <div className="relative w-full h-[70vh] mb-12 overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900">
      {/* Background Image with Overlay */}
      {backgroundImage ? (
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt={currentGame.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized={backgroundImage.includes('steamstatic.com') || backgroundImage.includes('akamai')}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-transparent" />
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            {currentGame.name}
          </h1>
          
          {/* Price Info */}
          <div className="flex items-center gap-4 mb-6">
            {currentGame.isFree ? (
              <span className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-lg">
                FREE
              </span>
            ) : currentGame.price ? (
              <div className="flex items-center gap-2">
                {currentGame.discountPercent && (
                  <span className="px-3 py-1 bg-green-600 text-white font-bold rounded text-sm">
                    -{currentGame.discountPercent}%
                  </span>
                )}
                {currentGame.originalPrice && currentGame.discountPercent && (
                  <span className="text-gray-400 line-through text-lg">
                    {currentGame.originalPrice}
                  </span>
                )}
                <span className="text-white font-bold text-2xl">
                  {currentGame.price}
                </span>
              </div>
            ) : null}
          </div>

          {/* CTA Button */}
          <Link
            href={`/game/${currentGame.appid}`}
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-lg transition-colors duration-200 shadow-lg"
          >
            View Details
          </Link>
        </div>
      </div>

      {/* Navigation Arrows */}
      {games.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors duration-200"
            aria-label="Previous game"
          >
            <svg
              className="w-6 h-6 text-white"
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
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors duration-200"
            aria-label="Next game"
          >
            <svg
              className="w-6 h-6 text-white"
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
        </>
      )}

      {/* Dot Indicators */}
      {games.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {games.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

