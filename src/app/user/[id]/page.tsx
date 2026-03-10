"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useInfiniteArtworks } from "@/hooks/useInfiniteArtworks";
import MasonryGrid from "@/components/gallery/MasonryGrid";
import InfiniteScroll from "@/components/gallery/InfiniteScroll";
import Avatar from "@/components/ui/Avatar";

const ACCOUNT_HASH = process.env.NEXT_PUBLIC_CF_IMAGES_HASH || "";

export default function UserPage() {
  const { id } = useParams<{ id: string }>();
  const { artworks, loading, initialLoading, hasMore, load } = useInfiniteArtworks({
    url: `/api/users/${id}/artworks`,
  });

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const displayName = artworks.length > 0 ? artworks[0].userDisplayName : "";

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        {displayName && (
          <div className="flex flex-col items-center gap-3">
            <Avatar name={displayName} size="lg" />
            <h1 className="text-2xl font-bold">{displayName} 的作品</h1>
          </div>
        )}
      </div>

      {initialLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="bg-gray-200 animate-pulse h-40" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <MasonryGrid artworks={artworks} accountHash={ACCOUNT_HASH} />
          <InfiniteScroll hasMore={hasMore} loading={loading} onLoadMore={() => load()} />
        </>
      )}
    </div>
  );
}
