"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface MediaItem {
  type: "image" | "video";
  id: number;
  thumbnail: string;
  fullUrl?: string;
  videoSources?: { [key: string]: string };
  name?: string;
}

interface MediaCarouselProps {
  screenshots?: Array<{ id: number; path_thumbnail: string; path_full: string }>;
  movies?: Array<{ id: number; name: string; thumbnail: string; webm: { [key: string]: string } }>;
  gameName: string;
}

export function MediaCarousel({ screenshots, movies, gameName }: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Combine screenshots and videos into a single array
  const mediaItems: MediaItem[] = [
    ...(movies?.map((movie) => ({
      type: "video" as const,
      id: movie.id,
      thumbnail: movie.thumbnail,
      videoSources: movie.webm,
      name: movie.name,
    })) || []),
    ...(screenshots?.map((screenshot) => ({
      type: "image" as const,
      id: screenshot.id,
      thumbnail: screenshot.path_thumbnail,
      fullUrl: screenshot.path_full,
    })) || []),
  ];

  if (mediaItems.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [mediaItems.length]);

  const currentItem = mediaItems[currentIndex];

  return (
    <div className="relative w-full">
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        {currentItem.type === "video" ? (
          <video
            key={currentItem.id}
            controls
            autoPlay
            className="w-full h-full"
            poster={currentItem.thumbnail}
          >
            {currentItem.videoSources &&
              Object.entries(currentItem.videoSources).map(([quality, url]) => (
                <source key={quality} src={url} type="video/webm" />
              ))}
            Your browser does not support the video tag.
          </video>
        ) : (
          <a
            href={currentItem.fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full"
          >
            <Image
              src={currentItem.fullUrl || currentItem.thumbnail}
              alt={`${gameName} ${currentItem.type === "image" ? "screenshot" : "video"} ${currentItem.id}`}
              fill
              className="object-contain"
              sizes="100vw"
              quality={95}
              unoptimized={currentItem.fullUrl?.includes('steamstatic.com') || currentItem.fullUrl?.includes('steamcdn')}
            />
          </a>
        )}

        {/* Navigation Buttons */}
        {mediaItems.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 z-10"
              aria-label="Previous"
            >
              <svg
                className="w-6 h-6"
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
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 z-10"
              aria-label="Next"
            >
              <svg
                className="w-6 h-6"
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

        {/* Media Type Indicator */}
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm font-semibold">
          {currentItem.type === "video" ? "🎬 Video" : "📷 Screenshot"}
        </div>

        {/* Counter */}
        {mediaItems.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
            {currentIndex + 1} / {mediaItems.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {mediaItems.length > 1 && (
        <div className="mt-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {mediaItems.map((item, index) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => goToSlide(index)}
                className={`relative flex-shrink-0 w-24 h-16 rounded overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-blue-500 scale-105"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                {item.type === "video" ? (
                  <>
                    <Image
                      src={item.thumbnail}
                      alt={item.name || `Video ${item.id}`}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </>
                ) : (
                  <Image
                    src={item.thumbnail}
                    alt={`Screenshot ${item.id}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dot Indicators */}
      {mediaItems.length > 1 && mediaItems.length <= 10 && (
        <div className="flex justify-center gap-2 mt-4">
          {mediaItems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-blue-500 w-8" : "bg-gray-600 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

