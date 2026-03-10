"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import LikeButton from "@/components/artwork/LikeButton";
import Lightbox from "@/components/artwork/Lightbox";
import { getImageUrl } from "@/lib/cloudflare-images";
import type { ArtworkWithUser } from "@/types";

const ACCOUNT_HASH = process.env.NEXT_PUBLIC_CF_IMAGES_HASH || "";

export default function ArtworkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [artwork, setArtwork] = useState<ArtworkWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchArtwork() {
      try {
        const res = await fetch(`/api/artworks/${id}`);
        if (!res.ok) {
          setError(res.status === 404 ? "作品不存在" : "加载失败");
          return;
        }
        const data: ArtworkWithUser = await res.json();
        setArtwork(data);
      } catch {
        setError("加载失败");
      } finally {
        setLoading(false);
      }
    }
    fetchArtwork();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-8 animate-pulse">
        <div className="bg-gray-200 rounded-3xl h-96" />
        <div className="mt-4 space-y-3">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (error || !artwork) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">😢</p>
        <p className="text-text-secondary">{error || "作品不存在"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-4 animate-fade-in">
      {/* Image */}
      <div
        className="relative cursor-zoom-in"
        onClick={() => setLightboxOpen(true)}
      >
        <img
          src={getImageUrl(ACCOUNT_HASH, artwork.imageId, "medium")}
          alt={artwork.title}
          className="w-full rounded-3xl shadow-md"
        />
      </div>

      {/* Info card */}
      <div className="bg-white rounded-3xl p-6 mt-4 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{artwork.title}</h1>
            <p className="text-text-secondary mt-1">
              by{" "}
              <Link href={`/user/${artwork.userId}`} className="text-primary hover:underline">
                {artwork.artistName}
              </Link>
            </p>
          </div>
          <LikeButton
            artworkId={artwork.id}
            initialLiked={artwork.isLiked || false}
            initialCount={artwork.likeCount}
          />
        </div>

        {artwork.description && (
          <p className="mt-4 text-text-secondary leading-relaxed">{artwork.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-text-secondary">
          {artwork.tags && artwork.tags.split(",").map((tag) => (
            <span key={tag} className="px-3 py-1 rounded-full bg-light-green/30 text-secondary">
              #{tag}
            </span>
          ))}
          {artwork.artworkDate && <span>创作于 {artwork.artworkDate}</span>}
          <span>上传于 {new Date(artwork.createdAt).toLocaleDateString("zh-CN")}</span>
        </div>
      </div>

      <Lightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        src={getImageUrl(ACCOUNT_HASH, artwork.imageId, "full")}
        alt={artwork.title}
      />
    </div>
  );
}
