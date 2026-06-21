import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.CLEAR_SECRET || "";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");

  if (!SECRET || secret !== SECRET) {
    return NextResponse.json({ error: "Unauthorized. Add ?secret=... from CLEAR_SECRET env." }, { status: 403 });
  }

  try {
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

    return NextResponse.json({ ok: true, message: "All families and accounts deleted." });
  } catch (error) {
    console.error("[clear-all]", error);
    return NextResponse.json({ error: "Failed to clear database" }, { status: 500 });
  }
}
