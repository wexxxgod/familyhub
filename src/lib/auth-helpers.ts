import { prisma } from "./prisma";
import { jwtDecrypt, EncryptJWT } from "jose";
import { createHash } from "crypto";
import { headers, cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

const COOKIE_NAME = "familyhub.session";

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
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
  });
}

function getTokenFromHeaders(): string | null {
  try {
    const cookieHeader = headers().get("cookie") || "";
    for (const c of cookieHeader.split(";")) {
      const idx = c.indexOf("=");
      if (idx === -1) continue;
      const name = c.slice(0, idx).trim();
      const value = c.slice(idx + 1).trim();
      if (name === COOKIE_NAME) return decodeURIComponent(value);
    }
    return null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(req?: NextRequest) {
  let token: string | null = null;

  if (req) {
    token = req.cookies.get(COOKIE_NAME)?.value || null;
  }
  if (!token) {
    token = getTokenFromHeaders();
  }
  if (!token) {
    try {
      token = cookies().get(COOKIE_NAME)?.value || null;
    } catch {}
  }
  if (!token) return null;

  try {
    const key = getSecretKey();
    if (!key) return null;
    const { payload } = await jwtDecrypt(token, key);
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
  } catch {
    return null;
  }
}

export async function requireAuth(req?: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireRole(roles: string[], req?: NextRequest) {
  const user = await requireAuth(req);
  if (!roles.includes(user.role)) throw new Error("Forbidden");
  return user;
}
