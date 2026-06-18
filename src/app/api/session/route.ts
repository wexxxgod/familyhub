import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser, logError, jsonError, safeInt, safeDate, Role } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ user: null }, { status: 200 });
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        familyId: user.familyId,
      },
    });
  } catch (error) {
    logError("session", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
