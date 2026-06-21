import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, logError, jsonError } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);
    if (!user.familyId) return NextResponse.json({ posts: [], users: [], archive: [], events: [] });

    const q = req.nextUrl.searchParams.get("q") || "";
    if (!q.trim()) return NextResponse.json({ posts: [], users: [], archive: [], events: [] });

    const [posts, users, archive, events] = await Promise.all([
      prisma.post.findMany({
        where: {
          OR: [
            { content: { contains: q, mode: "insensitive" } },
            { tags: { has: q.toLowerCase() } },
          ],
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
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { tags: { has: q.toLowerCase() } },
          ],
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
  } catch (error) {
    logError("search", error);
    return jsonError("Search failed", 500);
  }
}
