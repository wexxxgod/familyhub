import { NextResponse, NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { logError, jsonError, isValidEmail } from "@/lib/auth-helpers";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const { allowed } = checkRateLimit(`forgot-password:${ip}`, 3, 60000);
    if (!allowed) {
      return NextResponse.json({ error: "Слишком много попыток. Попробуйте позже." }, { status: 429 });
    }

    const { email } = await req.json();
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Введите корректный email" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ ok: true, message: "Если аккаунт существует, письмо отправлено" });
    }

    const resetToken = crypto.randomUUID();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpires },
    });

    sendPasswordResetEmail(email, resetToken).catch((err) =>
      logError("forgot-password_send", err),
    );

    return NextResponse.json({ ok: true, message: "Если аккаунт существует, письмо отправлено" });
  } catch (error) {
    logError("forgot-password", error);
    return jsonError("Внутренняя ошибка сервера", 500);
  }
}
