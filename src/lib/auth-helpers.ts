import { prisma } from "./prisma";
import { jwtDecrypt, EncryptJWT } from "jose";
import { createHash } from "crypto";
import { headers, cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

export const Role = { SUPER_ADMIN: "SUPER_ADMIN", PARENT: "PARENT", FAMILY_MEMBER: "FAMILY_MEMBER", GUEST: "GUEST" } as const;

export function logError(route: string, error: unknown) {
  console.error(`[${route}]`, error instanceof Error ? error.message : error);
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function safeInt(value: unknown): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : parseInt(String(value), 10);
  return isNaN(n) ? null : n;
}

export function safeDate(value: unknown): Date | null {
  if (value == null) return null;
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? null : d;
}

export function hasFamilyScope(itemFamilyId: string | null | undefined, userFamilyId: string | null | undefined): boolean {
  if (!itemFamilyId || !userFamilyId) return false;
  return itemFamilyId === userFamilyId;
}

const COOKIE_NAME = "familyhub.session";

function getSecretKey(): Uint8Array | null {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;
  return new Uint8Array(createHash("sha256").update(secret).digest());
}

const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

function getCookieExpires(): Date {
  return new Date(Date.now() + COOKIE_MAX_AGE * 1000);
}

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
    expires: getCookieExpires(),
    maxAge: COOKIE_MAX_AGE,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", expires: new Date(0), maxAge: 0 });
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

export async function requireAuth(req?: NextRequest): Promise<NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>> {
  const user = await getCurrentUser(req);
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireRole(roles: readonly string[], req?: NextRequest) {
  const user = await requireAuth(req);
  if (!roles.includes(user.role)) throw new Error("Forbidden");
  return user;
}
