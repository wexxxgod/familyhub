import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import crypto from "crypto";

function generateInviteCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  } catch {
    return NextResponse.json({ error: "Failed to fetch family" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
      data: { familyId: family.id },
    });

    return NextResponse.json({
      family: { id: family.id, name: family.name, inviteCode: family.inviteCode },
      inviteCode: family.inviteCode,
    });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Семья с таким названием уже существует" }, { status: 409 });
    }
    return NextResponse.json({ error: "Ошибка создания семьи" }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!user.familyId) {
      return NextResponse.json({ error: "Вы не в семье" }, { status: 400 });
    }

    const family = await prisma.family.findUnique({ where: { id: user.familyId } });
    if (!family || family.createdBy !== user.id) {
      return NextResponse.json({ error: "Только создатель может обновить код" }, { status: 403 });
    }

    const inviteCode = generateInviteCode();
    await prisma.family.update({
      where: { id: user.familyId },
      data: { inviteCode },
    });

    return NextResponse.json({ inviteCode });
  } catch {
    return NextResponse.json({ error: "Failed to regenerate code" }, { status: 500 });
  }
}
