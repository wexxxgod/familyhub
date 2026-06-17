import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, image: true, role: true },
    });
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}
