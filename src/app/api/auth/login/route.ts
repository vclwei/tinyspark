import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { users } from "../../../../../db/schema";
import { eq } from "drizzle-orm";
import { compareSync } from "bcryptjs";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json() as Record<string, string>;

    if (!username || !password) {
      return NextResponse.json({ error: "请输入用户名和密码" }, { status: 400 });
    }

    const { env } = await getCloudflareContext();
    const db = getDb(env.DB);

    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user || !compareSync(password, user.passwordHash)) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }

    const token = await signToken(
      { id: user.id, username: user.username, displayName: user.displayName, role: user.role },
      env.JWT_SECRET
    );

    return NextResponse.json(
      { user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role } },
      { headers: setAuthCookie(token) }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "登录失败" }, { status: 500 });
  }
}
