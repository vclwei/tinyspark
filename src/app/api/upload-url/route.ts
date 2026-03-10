import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { requireAuth } from "@/lib/auth";
import { getDirectUploadUrl } from "@/lib/cloudflare-images";

export async function POST() {
  try {
    await requireAuth();
    const { env } = await getCloudflareContext();

    const result = await getDirectUploadUrl(env.CF_ACCOUNT_ID, env.CF_IMAGES_TOKEN);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Upload URL error:", error);
    return NextResponse.json({ error: "获取上传链接失败" }, { status: 500 });
  }
}
