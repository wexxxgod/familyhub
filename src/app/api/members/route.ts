import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, logError, jsonError, safeInt, safeDate, Role } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return jsonError("Unauthorized", 401);
    if (!user.familyId) return NextResponse.json([]);

    const users = await prisma.user.findMany({
      where: { familyId: user.familyId },
      select: { id: true, name: true, email: true, image: true, role: true },
    });
    return NextResponse.json(users);
  } catch (error) {
    logError("get_members", error);
    return jsonError("Failed to fetch members", 500);
  }
}
