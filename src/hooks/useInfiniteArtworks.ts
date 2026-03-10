"use client";

import { useState, useCallback } from "react";
import type { ArtworkWithUser, PaginatedResponse } from "@/types";

export function useInfiniteArtworks({ url }: { url: string }) {
  const [artworks, setArtworks] = useState<ArtworkWithUser[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const load = useCallback(
    async (reset = false) => {
      if (loading) return;
      setLoading(true);

      try {
        const params = new URLSearchParams();
        if (!reset && cursor) params.set("cursor", cursor);

        const res = await fetch(`${url}?${params}`);
        const data: PaginatedResponse<ArtworkWithUser> = await res.json();

        if (reset) {
          setArtworks(data.data);
        } else {
          setArtworks((prev) => [...prev, ...data.data]);
        }
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } catch (error) {
        console.error("Failed to load artworks:", error);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [url, cursor, loading]
  );

  const reload = useCallback(() => {
    setCursor(null);
    setHasMore(true);
    setInitialLoading(true);
    load(true);
  }, [load]);

  return { artworks, loading, initialLoading, hasMore, load, reload, setArtworks };
}
