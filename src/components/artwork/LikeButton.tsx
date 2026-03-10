"use client";

import { useState } from "react";

interface LikeButtonProps {
  artworkId: string;
  initialLiked: boolean;
  initialCount: number;
}

export default function LikeButton({ artworkId, initialLiked, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);

  const toggle = async () => {
    const prevLiked = liked;
    const prevCount = count;

    // Optimistic update
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    if (!liked) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 300);
    }

    try {
      const res = await fetch(`/api/artworks/${artworkId}/like`, { method: "POST" });
      if (!res.ok) {
        setLiked(prevLiked);
        setCount(prevCount);
      }
    } catch {
      // Rollback on network error
      setLiked(prevLiked);
      setCount(prevCount);
    }
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 min-h-[44px] min-w-[44px] justify-center px-3 py-2 rounded-2xl hover:bg-yellow/10 transition-colors"
    >
      <span className={`text-xl ${animating ? "animate-bounce-star" : ""}`}>
        {liked ? "⭐" : "☆"}
      </span>
      <span className="text-sm font-medium text-text-secondary">{count}</span>
    </button>
  );
}
