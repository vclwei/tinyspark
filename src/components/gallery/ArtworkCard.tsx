"use client";

import Link from "next/link";
import type { ArtworkWithUser } from "@/types";
import { getImageUrl } from "@/lib/cloudflare-images";

interface ArtworkCardProps {
  artwork: ArtworkWithUser;
  accountHash: string;
  showPrivateBadge?: boolean;
}

export default function ArtworkCard({ artwork, accountHash, showPrivateBadge }: ArtworkCardProps) {
  return (
    <Link href={`/artwork/${artwork.id}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100">
        <div className="relative">
          <img
            src={getImageUrl(accountHash, artwork.imageId, "thumbnail")}
            alt={artwork.title}
            className="w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          {showPrivateBadge && !artwork.isPublic && (
            <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              私密
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-sm truncate">{artwork.title}</h3>
          <p className="text-xs text-text-secondary mt-0.5">{artwork.artistName}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-text-secondary">
              {artwork.userDisplayName}
            </span>
            {artwork.likeCount > 0 && (
              <span className="text-xs text-yellow flex items-center gap-0.5">
                ⭐ {artwork.likeCount}
              </span>
            )}
          </div>
          {artwork.tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {artwork.tags.split(",").map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-light-green/30 text-secondary">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
