import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, logError, jsonError, safeInt, safeDate, Role } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["SUPER_ADMIN", "PARENT"], req);
    if (!user.familyId) return NextResponse.json({ error: "Нет семьи" }, { status: 400 });

    const familyFilter = { familyId: user.familyId };

    const [users, posts, comments, likes, archiveItems, events, memories] = await Promise.all([
      prisma.user.count({ where: familyFilter }),
      prisma.post.count({ where: { author: familyFilter } }),
      prisma.comment.count({ where: { author: familyFilter } }),
      prisma.like.count({ where: { user: familyFilter } }),
      prisma.archiveItem.count({ where: { uploadedBy: familyFilter } }),
      prisma.event.count({ where: { createdBy: familyFilter } }),
      prisma.memory.count({ where: { author: familyFilter } }),
    ]);

    const stats = { users, posts, comments, likes, archiveItems, events, memories };

    return NextResponse.json(stats);
  } catch (error) {
    logError("admin_get_stats", error);
    return jsonError("Ошибка получения статистики", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { action, data } = await req.json();

    if (action === "delete_user" || action === "change_role") {
      if (user.role !== "SUPER_ADMIN") return jsonError("Forbidden", 403);
    }

    if (action === "delete_user") {
      await prisma.user.delete({ where: { id: data.userId } });
      return NextResponse.json({ success: true });
    }

    if (action === "change_role") {
      await prisma.user.update({
        where: { id: data.userId },
        data: { role: data.role },
      });
      return NextResponse.json({ success: true });
    }

    if (action === "clear_all") {
      await prisma.petPhoto.deleteMany();
      await prisma.pet.deleteMany();
      await prisma.familyMember.deleteMany();
      await prisma.pollVote.deleteMany();
      await prisma.poll.deleteMany();
      await prisma.activityLog.deleteMany();
      await prisma.memory.deleteMany();
      await prisma.archiveItem.deleteMany();
      await prisma.event.deleteMany();
      await prisma.pushSubscription.deleteMany();
      await prisma.notification.deleteMany();
      await prisma.chatRoomMember.deleteMany();
      await prisma.message.deleteMany();
      await prisma.chatRoom.deleteMany();
      await prisma.like.deleteMany();
      await prisma.comment.deleteMany();
      await prisma.post.deleteMany();
      await prisma.user.deleteMany();
      await prisma.family.deleteMany();
      return NextResponse.json({ success: true, message: "All data cleared" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    logError("admin_action", error);
    return jsonError("Ошибка выполнения действия", 500);
  }
}
