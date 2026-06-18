import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, createSessionToken, setSessionCookie, logError, jsonError, safeInt, safeDate, Role } from "@/lib/auth-helpers";
import crypto from "crypto";

function generateInviteCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);

    if (!user.familyId) {
      return NextResponse.json({ family: null, members: [], isCreator: false });
    }

    const family = await prisma.family.findUnique({
      where: { id: user.familyId },
      include: { members: { select: { id: true, name: true, email: true, image: true, role: true, createdAt: true } } },
    });

    if (!family) {
      return NextResponse.json({ family: null, members: [], isCreator: false });
    }

    return NextResponse.json({
      family: { id: family.id, name: family.name, inviteCode: family.inviteCode, createdAt: family.createdAt },
      members: family.members,
      isCreator: family.createdBy === user.id,
    });
  } catch (error) {
    logError("family_GET", error);
    return jsonError("Failed to fetch family", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);

    if (user.familyId) {
      return NextResponse.json({ error: "Вы уже в семье" }, { status: 400 });
    }

    const { name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Название семьи обязательно" }, { status: 400 });
    }

    const inviteCode = generateInviteCode();

    const family = await prisma.family.create({
      data: {
        name: name.trim(),
        inviteCode,
        createdBy: user.id,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { familyId: family.id, role: Role.PARENT },
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
      family: { id: family.id, name: family.name, inviteCode: family.inviteCode },
      inviteCode: family.inviteCode,
    });

    if (token) setSessionCookie(response, token);
    return response;
  } catch (error: any) {
    logError("family_POST", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Семья с таким названием уже существует" }, { status: 409 });
    }
    return jsonError("Ошибка создания семьи", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);

    if (!user.familyId) {
      return NextResponse.json({ error: "Вы не в семье" }, { status: 400 });
    }

    const family = await prisma.family.findUnique({ where: { id: user.familyId } });
    if (!family || family.createdBy !== user.id) {
      return NextResponse.json({ error: "Только создатель может удалять участников" }, { status: 403 });
    }

    const { userId } = await req.json();
    if (userId === user.id) {
      return NextResponse.json({ error: "Нельзя удалить себя" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser || targetUser.familyId !== user.familyId) {
      return NextResponse.json({ error: "Пользователь не найден в семье" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { familyId: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("family_DELETE", error);
    return jsonError("Ошибка удаления", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);

    if (!user.familyId) {
      return NextResponse.json({ error: "Вы не в семье" }, { status: 400 });
    }

    const family = await prisma.family.findUnique({ where: { id: user.familyId } });
    if (!family || family.createdBy !== user.id) {
      return NextResponse.json({ error: "Только создатель может менять настройки" }, { status: 403 });
    }

    const body = await req.json();

    if (body.name?.trim()) {
      await prisma.family.update({
        where: { id: user.familyId },
        data: { name: body.name.trim() },
      });
      return NextResponse.json({ success: true });
    }

    const inviteCode = generateInviteCode();
    await prisma.family.update({
      where: { id: user.familyId },
      data: { inviteCode },
    });

    return NextResponse.json({ inviteCode });
  } catch (error) {
    logError("family_PATCH", error);
    return jsonError("Failed to update family", 500);
  }
}
