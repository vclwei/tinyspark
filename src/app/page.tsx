"use client";

import { useEffect } from "react";
import MasonryGrid from "@/components/gallery/MasonryGrid";
import InfiniteScroll from "@/components/gallery/InfiniteScroll";
import { useInfiniteArtworks } from "@/hooks/useInfiniteArtworks";

const ACCOUNT_HASH = process.env.NEXT_PUBLIC_CF_IMAGES_HASH || "";

export default function HomePage() {
  const { artworks, loading, initialLoading, hasMore, load } = useInfiniteArtworks({
    url: "/api/artworks",
  });

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-primary">✨</span> 小小画廊
        </h1>
        <p className="text-text-secondary">每一幅作品都是独一无二的</p>
      </div>

      {initialLoading ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="break-inside-avoid">
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                <div className="bg-gray-200 animate-pulse" style={{ height: `${150 + (i % 3) * 60}px` }} />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
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
