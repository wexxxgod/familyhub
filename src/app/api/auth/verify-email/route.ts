import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError, jsonError } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) return NextResponse.json({ error: "Токен не указан" }, { status: 400 });

    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) return NextResponse.json({ error: "Неверный или устаревший токен" }, { status: 400 });

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("verify-email", error);
    return jsonError("Ошибка подтверждения email", 500);
  }
}
