import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie, logError, jsonError } from "@/lib/auth-helpers";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const { allowed } = checkRateLimit(`login:${ip}`, 5, 60000);
    if (!allowed) {
      return NextResponse.json({ error: "Слишком много попыток. Попробуйте позже." }, { status: 429 });
    }

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
