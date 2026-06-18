import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie, logError, jsonError } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
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

    const token = await createSessionToken({
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      image: user.image,
      familyId: user.familyId,
    });
    if (!token) {
      return NextResponse.json({ error: "server misconfiguration" }, { status: 500 });
    }

    const response = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    logError("login", error);
    return jsonError("Внутренняя ошибка сервера", 500);
  }
}
