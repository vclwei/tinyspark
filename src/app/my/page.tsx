"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useInfiniteArtworks } from "@/hooks/useInfiniteArtworks";
import MasonryGrid from "@/components/gallery/MasonryGrid";
import InfiniteScroll from "@/components/gallery/InfiniteScroll";
import Button from "@/components/ui/Button";

const ACCOUNT_HASH = process.env.NEXT_PUBLIC_CF_IMAGES_HASH || "";

export default function MyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { artworks, loading, initialLoading, hasMore, load } = useInfiniteArtworks({
    url: user ? `/api/users/${user.id}/artworks` : "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      load(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">我的作品集</h1>
          <p className="text-text-secondary text-sm mt-1">{user.displayName} 的所有作品</p>
        </div>
        <Link href="/upload">
          <Button className="w-full sm:w-auto">上传作品 ✨</Button>
        </Link>
      </div>

      {initialLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="bg-gray-200 animate-pulse h-40" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <MasonryGrid artworks={artworks} accountHash={ACCOUNT_HASH} showPrivateBadge />
          <InfiniteScroll hasMore={hasMore} loading={loading} onLoadMore={() => load()} />
        </>
      )}
    </div>
  );
}
