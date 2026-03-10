import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { artworks, users, likes } from "../../../../../db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { deleteImage } from "@/lib/cloudflare-images";
import { artworkSelectFields } from "@/lib/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);
    const currentUser = await getAuthUser();

    const results = await db
      .select(artworkSelectFields)
      .from(artworks)
      .innerJoin(users, eq(artworks.userId, users.id))
      .where(eq(artworks.id, id))
      .limit(1);

    if (results.length === 0) {
      return NextResponse.json({ error: "作品不存在" }, { status: 404 });
    }

    const artwork = results[0];

    // Private artwork can only be viewed by owner or admin
    if (!artwork.isPublic && (!currentUser || (currentUser.id !== artwork.userId && currentUser.role !== "admin"))) {
      return NextResponse.json({ error: "无权查看" }, { status: 403 });
    }

    let isLiked = false;
    if (currentUser) {
      const likeResult = await db
        .select()
        .from(likes)
        .where(and(eq(likes.userId, currentUser.id), eq(likes.artworkId, id)))
        .limit(1);
      isLiked = likeResult.length > 0;
    }

    return NextResponse.json({ ...artwork, isLiked });
  } catch (error) {
    console.error("Get artwork error:", error);
    return NextResponse.json({ error: "获取作品失败" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getAuthUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    const existing = await db.query.artworks.findFirst({
      where: eq(artworks.id, id),
    });

    if (!existing) {
      return NextResponse.json({ error: "作品不存在" }, { status: 404 });
    }

    if (existing.userId !== currentUser.id && currentUser.role !== "admin") {
      return NextResponse.json({ error: "无权编辑" }, { status: 403 });
    }

    const body = await request.json() as Record<string, unknown>;
    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.artistName !== undefined) updates.artistName = body.artistName;
    if (body.description !== undefined) updates.description = body.description;
    if (body.tags !== undefined) updates.tags = body.tags;
    if (body.isPublic !== undefined) updates.isPublic = body.isPublic;
    if (body.artworkDate !== undefined) updates.artworkDate = body.artworkDate;

    await db.update(artworks).set(updates).where(eq(artworks.id, id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Update artwork error:", error);
    return NextResponse.json({ error: "更新作品失败" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getAuthUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    const existing = await db.query.artworks.findFirst({
      where: eq(artworks.id, id),
    });

    if (!existing) {
      return NextResponse.json({ error: "作品不存在" }, { status: 404 });
    }

    if (existing.userId !== currentUser.id && currentUser.role !== "admin") {
      return NextResponse.json({ error: "无权删除" }, { status: 403 });
    }

    // Delete from CF Images
    try {
      await deleteImage(existing.imageId, env.CF_ACCOUNT_ID, env.CF_IMAGES_TOKEN);
    } catch {
      // Image deletion failure shouldn't block DB deletion
    }

    await db.delete(artworks).where(eq(artworks.id, id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete artwork error:", error);
    return NextResponse.json({ error: "删除作品失败" }, { status: 500 });
  }
}
