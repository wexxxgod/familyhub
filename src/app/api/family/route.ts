import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, createSessionToken, setSessionCookie } from "@/lib/auth-helpers";
import crypto from "crypto";

function generateInviteCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
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

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (user.familyId) {
      return NextResponse.json({ error: "Р’С‹ СѓР¶Рµ РІ СЃРµРјСЊРµ" }, { status: 400 });
    }

    const { name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "РќР°Р·РІР°РЅРёРµ СЃРµРјСЊРё РѕР±СЏР·Р°С‚РµР»СЊРЅРѕ" }, { status: 400 });
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
      data: { familyId: family.id, role: "PARENT" },
    });

    const token = await createSessionToken({
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      image: user.image,
      familyId: family.id,
    });

    const response = NextResponse.json({
      family: { id: family.id, name: family.name, inviteCode: family.inviteCode },
      inviteCode: family.inviteCode,
    });

    if (token) setSessionCookie(response, token);
    return response;
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "РЎРµРјСЊСЏ СЃ С‚Р°РєРёРј РЅР°Р·РІР°РЅРёРµРј СѓР¶Рµ СЃСѓС‰РµСЃС‚РІСѓРµС‚" }, { status: 409 });
    }
    return NextResponse.json({ error: "РћС€РёР±РєР° СЃРѕР·РґР°РЅРёСЏ СЃРµРјСЊРё" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!user.familyId) {
      return NextResponse.json({ error: "Р’С‹ РЅРµ РІ СЃРµРјСЊРµ" }, { status: 400 });
    }

    const family = await prisma.family.findUnique({ where: { id: user.familyId } });
    if (!family || family.createdBy !== user.id) {
      return NextResponse.json({ error: "РўРѕР»СЊРєРѕ СЃРѕР·РґР°С‚РµР»СЊ РјРѕР¶РµС‚ СѓРґР°Р»СЏС‚СЊ СѓС‡Р°СЃС‚РЅРёРєРѕРІ" }, { status: 403 });
    }

    const { userId } = await req.json();
    if (userId === user.id) {
      return NextResponse.json({ error: "РќРµР»СЊР·СЏ СѓРґР°Р»РёС‚СЊ СЃРµР±СЏ" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser || targetUser.familyId !== user.familyId) {
      return NextResponse.json({ error: "РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РЅРµ РЅР°Р№РґРµРЅ РІ СЃРµРјСЊРµ" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { familyId: null },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!user.familyId) {
      return NextResponse.json({ error: "Р’С‹ РЅРµ РІ СЃРµРјСЊРµ" }, { status: 400 });
    }

    const family = await prisma.family.findUnique({ where: { id: user.familyId } });
    if (!family || family.createdBy !== user.id) {
      return NextResponse.json({ error: "РўРѕР»СЊРєРѕ СЃРѕР·РґР°С‚РµР»СЊ РјРѕР¶РµС‚ РѕР±РЅРѕРІРёС‚СЊ РєРѕРґ" }, { status: 403 });
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

