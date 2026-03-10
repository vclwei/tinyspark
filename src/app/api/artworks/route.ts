import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { artworks, users, likes } from "../../../../db/schema";
import { eq, desc, and, lt, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { requireAuth, getAuthUser } from "@/lib/auth";
import { PAGE_SIZE } from "@/lib/constants";
import { artworkSelectFields } from "@/lib/queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(Number(searchParams.get("limit")) || PAGE_SIZE, 50);

    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);
    const currentUser = await getAuthUser();

    const conditions = [eq(artworks.isPublic, true)];
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

    // Check if current user liked each artwork
    if (currentUser && data.length > 0) {
      const artworkIds = data.map((a) => a.id);
      const userLikes = await db
        .select({ artworkId: likes.artworkId })
        .from(likes)
        .where(
          and(
            eq(likes.userId, currentUser.id),
            sql`${likes.artworkId} IN (${sql.join(
              artworkIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          )
        );
      const likedSet = new Set(userLikes.map((l) => l.artworkId));
      const dataWithLikes = data.map((a) => ({ ...a, isLiked: likedSet.has(a.id) }));
      return NextResponse.json({
        data: dataWithLikes,
        nextCursor: hasMore ? data[data.length - 1].createdAt : null,
        hasMore,
      });
    }

    return NextResponse.json({
      data: data.map((a) => ({ ...a, isLiked: false })),
      nextCursor: hasMore ? data[data.length - 1].createdAt : null,
      hasMore,
    });
  } catch (error) {
    console.error("List artworks error:", error);
    return NextResponse.json({ error: "获取作品列表失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { title, artistName, description, tags, imageId, isPublic, artworkDate } =
      await request.json() as {
        title: string; artistName: string; description?: string;
        tags?: string; imageId: string; isPublic?: boolean; artworkDate?: string;
      };

    if (!title || !artistName || !imageId) {
      return NextResponse.json({ error: "标题、作者名和图片是必填的" }, { status: 400 });
    }

    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    const id = nanoid();
    await db.insert(artworks).values({
      id,
      userId: user.id,
      title,
      artistName,
      description: description || null,
      tags: tags || null,
      imageId,
      isPublic: isPublic !== false,
      artworkDate: artworkDate || null,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create artwork error:", error);
    return NextResponse.json({ error: "创建作品失败" }, { status: 500 });
  }
}
