import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.familyId) return NextResponse.json({ posts: [], users: [], archive: [], events: [] });

    const q = req.nextUrl.searchParams.get("q") || "";
    if (!q.trim()) return NextResponse.json({ posts: [], users: [], archive: [], events: [] });

    const [posts, users, archive, events] = await Promise.all([
      prisma.post.findMany({
        where: {
          content: { contains: q, mode: "insensitive" },
          author: { familyId: user.familyId },
        },
        include: { author: true },
        take: 10,
      }),
      prisma.user.findMany({
        where: {
          name: { contains: q, mode: "insensitive" },
          familyId: user.familyId,
        },
        take: 10,
      }),
      prisma.archiveItem.findMany({
        where: {
          title: { contains: q, mode: "insensitive" },
          uploadedBy: { familyId: user.familyId },
        },
        take: 10,
      }),
      prisma.event.findMany({
        where: {
          title: { contains: q, mode: "insensitive" },
          createdBy: { familyId: user.familyId },
        },
        take: 10,
      }),
    ]);

    return NextResponse.json({ posts, users, archive, events });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
