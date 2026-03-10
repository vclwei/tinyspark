import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { artworks, users } from "../../../../../../db/schema";
import { eq, desc, and, lt } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { PAGE_SIZE } from "@/lib/constants";
import { artworkSelectFields } from "@/lib/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(Number(searchParams.get("limit")) || PAGE_SIZE, 50);

    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);
    const currentUser = await getAuthUser();

    const isOwner = currentUser?.id === userId;

    const conditions = [eq(artworks.userId, userId)];
    if (!isOwner) {
      conditions.push(eq(artworks.isPublic, true));
    }
    if (cursor) {
      conditions.push(lt(artworks.createdAt, cursor));
    }

    const results = await db
      .select(artworkSelectFields)
      .from(artworks)
      .innerJoin(users, eq(artworks.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(artworks.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    return NextResponse.json({
      data: data.map((a) => ({ ...a, isLiked: false })),
      nextCursor: hasMore ? data[data.length - 1].createdAt : null,
      hasMore,
    });
  } catch (error) {
    console.error("User artworks error:", error);
    return NextResponse.json({ error: "获取用户作品失败" }, { status: 500 });
  }
}
