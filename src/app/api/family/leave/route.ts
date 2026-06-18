import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logError, jsonError, Role } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    if (!user.familyId) {
      return NextResponse.json({ error: "Вы не в семье" }, { status: 400 });
    }

    const family = await prisma.family.findUnique({ where: { id: user.familyId } });
    if (family && family.createdBy === user.id) {
      return NextResponse.json({ error: "Создатель не может покинуть семью" }, { status: 400 });
    }

    await prisma.notification.deleteMany({ where: { userId: user.id } });
    await prisma.chatRoomMember.deleteMany({ where: { userId: user.id } });

    await prisma.user.update({
      where: { id: user.id },
      data: { familyId: null, role: Role.GUEST },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return jsonError("Unauthorized", 401);
    }
    logError("family_leave", error);
    return jsonError("Ошибка при выходе из семьи", 500);
  }
}
