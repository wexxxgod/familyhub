import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logError, jsonError } from "@/lib/auth-helpers";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const { allowed } = checkRateLimit(`reset-password:${ip}`, 3, 60000);
    if (!allowed) {
      return NextResponse.json({ error: "Слишком много попыток. Попробуйте позже." }, { status: 429 });
    }

    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ error: "Все поля обязательны" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Пароль должен быть не менее 6 символов" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpires: { gt: new Date() } },
    });
    if (!user) {
      return NextResponse.json({ error: "Ссылка устарела или недействительна" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpires: null },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logError("reset-password", error);
    return jsonError("Внутренняя ошибка сервера", 500);
  }
}
