import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, createSessionToken, setSessionCookie } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (user.familyId) {
      return NextResponse.json({ error: "Вы уже в семье" }, { status: 400 });
    }

    const { inviteCode } = await req.json();
    if (!inviteCode?.trim()) {
      return NextResponse.json({ error: "Введите код приглашения" }, { status: 400 });
    }

    const family = await prisma.family.findUnique({
      where: { inviteCode: inviteCode.trim().toUpperCase() },
    });

    if (!family) {
      return NextResponse.json({ error: "Неверный код приглашения" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { familyId: family.id },
    });

    const token = await createSessionToken({
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      image: user.image,
      familyId: family.id,
    });

    const response = NextResponse.json({
      family: { id: family.id, name: family.name },
    });

    if (token) setSessionCookie(response, token);
    return response;
  } catch {
    return NextResponse.json({ error: "Failed to join family" }, { status: 500 });
  }
}
