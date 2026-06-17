import { prisma } from "./prisma";
import { jwtDecrypt, EncryptJWT } from "jose";
import { createHash } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME_SECURE = "__Secure-next-auth.session-token";
const COOKIE_NAME_INSECURE = "next-auth.session-token";

function getCookieName(): string {
  return process.env.NODE_ENV === "production" ? COOKIE_NAME_SECURE : COOKIE_NAME_INSECURE;
}

function getSecretKey(): Uint8Array | null {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;
  return new Uint8Array(createHash("sha256").update(secret).digest());
}

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

export async function createSessionToken(user: {
  id: string; role: string; email: string; name: string | null; image: string | null; familyId: string | null;
}): Promise<string | null> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;
  const key = new Uint8Array(createHash("sha256").update(secret).digest());
  const now = Math.floor(Date.now() / 1000);
  return await new EncryptJWT({
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    picture: user.image,
    familyId: user.familyId,
    sub: user.id,
  })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt(now)
    .setExpirationTime(now + COOKIE_MAX_AGE)
    .encrypt(key);
}

export function setSessionCookie(response: NextResponse, token: string): void {
  const isSecure = process.env.NODE_ENV === "production";
  response.cookies.set(getCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: isSecure,
    maxAge: COOKIE_MAX_AGE,
  });
}

async function decodeSessionCookie(): Promise<any | null> {
  try {
    const token = cookies().get(getCookieName())?.value;
    if (!token) return null;
    const key = getSecretKey();
    if (!key) return null;
    const { payload } = await jwtDecrypt(token, key);
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const payload = await decodeSessionCookie();
  if (!payload?.id) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: payload.id as string },
    select: { id: true, email: true, name: true, image: true, role: true, familyId: true },
  });

  if (!dbUser) return null;

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    image: dbUser.image,
    role: dbUser.role,
    familyId: dbUser.familyId,
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireRole(...roles: string[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) throw new Error("Forbidden");
  return user;
}
