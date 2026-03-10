import { artworks, users, likes } from "../../db/schema";
import { eq, sql } from "drizzle-orm";

export const artworkSelectFields = {
  id: artworks.id,
  title: artworks.title,
  artistName: artworks.artistName,
  description: artworks.description,
  tags: artworks.tags,
  imageId: artworks.imageId,
  isPublic: artworks.isPublic,
  createdAt: artworks.createdAt,
  artworkDate: artworks.artworkDate,
  userId: artworks.userId,
  userDisplayName: users.displayName,
  likeCount: sql<number>`(SELECT COUNT(*) FROM likes WHERE likes.artwork_id = ${artworks.id})`,
} as const;
