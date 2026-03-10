import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  role: "admin" | "user";
}

const COOKIE_NAME = "token";

function getSecret(jwtSecret: string) {
  return new TextEncoder().encode(jwtSecret);
}

export async function signToken(user: AuthUser, jwtSecret: string): Promise<string> {
  return new SignJWT({
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecret(jwtSecret));
}

export async function verifyToken(token: string, jwtSecret: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(jwtSecret));
    return payload as unknown as AuthUser;
  } catch {
    return null;
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const { env } = await getCloudflareContext();
  return verifyToken(token, env.JWT_SECRET);
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireRole(...roles: Array<"admin" | "user">): Promise<AuthUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

export function setAuthCookie(token: string) {
  return {
    "Set-Cookie": `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`,
  };
}
