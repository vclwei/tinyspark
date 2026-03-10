"use client";

import type { ArtworkWithUser } from "@/types";
import ArtworkCard from "./ArtworkCard";

interface MasonryGridProps {
  artworks: ArtworkWithUser[];
  accountHash: string;
  showPrivateBadge?: boolean;
}

export default function MasonryGrid({ artworks, accountHash, showPrivateBadge }: MasonryGridProps) {
  if (artworks.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <p className="text-6xl mb-4">🎨</p>
        <p className="text-text-secondary text-lg">还没有作品哦</p>
        <p className="text-text-secondary text-sm mt-1">快去创作吧！</p>
      </div>
    );
  }

  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {artworks.map((artwork) => (
        <div key={artwork.id} className="break-inside-avoid animate-fade-in">
          <ArtworkCard
            artwork={artwork}
            accountHash={accountHash}
            showPrivateBadge={showPrivateBadge}
          />
        </div>
      ))}
    </div>
  );
}
