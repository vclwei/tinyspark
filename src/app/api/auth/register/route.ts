import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { users } from "../../../../../db/schema";
import { hashSync } from "bcryptjs";
import { nanoid } from "nanoid";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, displayName, password } = await request.json() as Record<string, string>;

    if (!username || !displayName || !password) {
      return NextResponse.json({ error: "所有字段都是必填的" }, { status: 400 });
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({ error: "用户名需要3-20个字符" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "密码至少需要6个字符" }, { status: 400 });
    }

    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    const userId = nanoid();
    const passwordHash = hashSync(password, 10);

    try {
      await db.insert(users).values({
      id: userId,
      username,
      displayName,
      passwordHash,
      role: "user",
    });
    } catch (e) {
      if (e instanceof Error && e.message.includes("UNIQUE")) {
        return NextResponse.json({ error: "用户名已被占用" }, { status: 400 });
      }
      throw e;
    }

    const token = await signToken(
      { id: userId, username, displayName, role: "user" },
      env.JWT_SECRET
    );

    return NextResponse.json(
      { user: { id: userId, username, displayName, role: "user" } },
      { status: 201, headers: setAuthCookie(token) }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
