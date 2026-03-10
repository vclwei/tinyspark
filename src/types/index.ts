export interface ArtworkWithUser {
  id: string;
  title: string;
  artistName: string;
  description: string | null;
  tags: string | null;
  imageId: string;
  isPublic: boolean;
  createdAt: string;
  artworkDate: string | null;
  userId: string;
  userDisplayName: string;
  likeCount: number;
  isLiked?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
