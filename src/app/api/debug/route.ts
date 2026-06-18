import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookieHeader = headers().get("cookie") || "(empty)";
    const envSecret = process.env.NEXTAUTH_SECRET ? "set" : "missing";

    const allHeaders: Record<string, string> = {};
    try {
      headers().forEach((value, key) => {
        allHeaders[key] = value;
      });
    } catch {}

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, familyId: user.familyId },
      envSecret,
      cookieHeader: cookieHeader.substring(0, 200),
      allHeaders,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
