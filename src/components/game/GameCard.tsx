"use client";

import Link from "next/link";
import Image from "next/image";

interface GameCardProps {
  game: {
    appid: number;
    name: string;
    image?: string;
    price?: string;
    originalPrice?: string;
    discountPercent?: number;
    isFree?: boolean;
  };
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/game/${game.appid}`}>
      <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors duration-200 cursor-pointer border border-gray-700 hover:border-blue-500">
        {game.image ? (
          <div className="relative w-full h-48 bg-gray-900">
            <Image
              src={game.image}
              alt={game.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              quality={90}
              unoptimized={game.image?.includes('steamstatic.com') || game.image?.includes('akamai')}
            />
            {game.discountPercent && (
              <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded font-bold text-sm shadow-lg">
                -{game.discountPercent}%
              </div>
            )}
            {game.isFree && (
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded font-bold text-sm shadow-lg">
                FREE
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-900 flex items-center justify-center">
            <span className="text-gray-600 text-sm">No Image</span>
          </div>
        )}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white line-clamp-2 mb-2">
            {game.name}
          </h3>
          {game.price && (
            <div className="flex items-center gap-2 flex-wrap">
              {game.discountPercent && (
                <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
                  -{game.discountPercent}%
                </span>
              )}
              <div className="flex items-center gap-1">
                {game.originalPrice && game.discountPercent && (
                  <span className="text-gray-400 text-sm line-through">
                    {game.originalPrice}
                  </span>
                )}
                <span className={`font-bold ${game.discountPercent ? "text-green-400" : "text-white"}`}>
                  {game.price}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

