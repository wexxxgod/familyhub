import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth, createSessionToken, setSessionCookie, logError, jsonError } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { newEmail, password } = await req.json();

    if (!newEmail || !newEmail.includes("@")) {
      return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: "Введите пароль" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || !dbUser.passwordHash) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, dbUser.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
    }

    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: "Этот email уже используется" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { email: newEmail },
    });

    const token = await createSessionToken({
      id: updated.id,
      role: updated.role,
      email: updated.email,
      name: updated.name,
      image: updated.image,
      familyId: updated.familyId,
    });

    const response = NextResponse.json({
      user: { id: updated.id, email: updated.email, name: updated.name },
    });

    if (token) setSessionCookie(response, token);
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    logError("change-email", error);
    return jsonError("Внутренняя ошибка сервера", 500);
  }
}
