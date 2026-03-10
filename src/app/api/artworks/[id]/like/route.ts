import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { likes } from "../../../../../../db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: artworkId } = await params;
    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    // Check if already liked
    const existing = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, user.id), eq(likes.artworkId, artworkId)))
      .limit(1);

    if (existing.length > 0) {
      // Unlike
      await db
        .delete(likes)
        .where(and(eq(likes.userId, user.id), eq(likes.artworkId, artworkId)));
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await db.insert(likes).values({
        userId: user.id,
        artworkId,
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Like error:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
