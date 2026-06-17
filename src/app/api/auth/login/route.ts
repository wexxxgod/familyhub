import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { encode } from "next-auth/jwt";

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

    const token = await encode({
      token: {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
        picture: user.image,
      },
      secret,
    });

    const isSecure = process.env.NODE_ENV === "production";
    const cookieName = isSecure ? "__Secure-next-auth.session-token" : "next-auth.session-token";

    const response = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: isSecure,
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (e) {
    console.error("[LOGIN ERROR]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
