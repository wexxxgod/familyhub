import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { EncryptJWT } from "jose";

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

async function createToken(payload: Record<string, unknown>, secret: string): Promise<string> {
  const key = new Uint8Array(createHash("sha256").update(secret).digest());
  const now = Math.floor(Date.now() / 1000);
  const exp = now + COOKIE_MAX_AGE;
  return await new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .encrypt(key);
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
    }

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "server misconfiguration" }, { status: 500 });
    }

    const token = await createToken({
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      picture: user.image,
      familyId: user.familyId,
      sub: user.id,
    }, secret);

    const isSecure = process.env.NODE_ENV === "production";
    const cookieName = isSecure ? "__Secure-next-auth.session-token" : "next-auth.session-token";

    const response = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: isSecure,
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch (e) {
    console.error("[LOGIN ERROR]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
