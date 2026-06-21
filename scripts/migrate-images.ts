import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

async function saveBase64(dataUrl: string): Promise<string | null> {
  if (!dataUrl || !dataUrl.startsWith("data:")) return null;
  const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) return null;
  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const base64 = match[2];
  const buffer = Buffer.from(base64, "base64");
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

async function processField<T>(
  records: T[],
  getFields: (r: T) => (string | string[] | null | undefined)[],
  setField: (r: T, url: string | null) => void,
  setArrayField?: (r: T, urls: string[]) => void,
) {
  for (const record of records) {
    const fields = getFields(record);
    for (let i = 0; i < fields.length; i++) {
      const val = fields[i];
      if (typeof val === "string") {
        const url = await saveBase64(val);
        if (url) setField(record, url);
      } else if (Array.isArray(val)) {
        const urls: string[] = [];
        for (const v of val) {
          const u = await saveBase64(v);
          urls.push(u ?? v);
        }
        if (setArrayField) setArrayField(record, urls);
      }
    }
  }
}

async function main() {
  await mkdir(UPLOAD_DIR, { recursive: true });
  console.log("📁 Upload dir ready:", UPLOAD_DIR);

  // Users
  const users = await prisma.user.findMany({ select: { id: true, image: true } });
  for (const u of users) {
    if (u.image?.startsWith("data:")) {
      const url = await saveBase64(u.image);
      if (url) {
        await prisma.user.update({ where: { id: u.id }, data: { image: url } });
        console.log(`  ✅ User ${u.id}: image migrated`);
      }
    }
  }

  // Posts
  const posts = await prisma.post.findMany({ select: { id: true, image: true, images: true } });
  for (const p of posts) {
    let changed = false;
    const data: any = {};
    if (p.image?.startsWith("data:")) {
      const url = await saveBase64(p.image);
      if (url) { data.image = url; changed = true; }
    }
    if (p.images?.length) {
      const newImages: string[] = [];
      for (const img of p.images) {
        if (img.startsWith("data:")) {
          const url = await saveBase64(img);
          newImages.push(url ?? img);
          changed = true;
        } else {
          newImages.push(img);
        }
      }
      if (changed) data.images = newImages;
    }
    if (changed) {
      await prisma.post.update({ where: { id: p.id }, data });
      console.log(`  ✅ Post ${p.id}: images migrated`);
    }
  }

  // Archive items
  const archives = await prisma.archiveItem.findMany({ select: { id: true, url: true, images: true } });
  for (const a of archives) {
    let changed = false;
    const data: any = {};
    if (a.url?.startsWith("data:")) {
      const url = await saveBase64(a.url);
      if (url) { data.url = url; changed = true; }
    }
    if (a.images?.length) {
      const newImages: string[] = [];
      for (const img of a.images) {
        if (img.startsWith("data:")) {
          const url = await saveBase64(img);
          newImages.push(url ?? img);
          changed = true;
        } else {
          newImages.push(img);
        }
      }
      if (changed) data.images = newImages;
    }
    if (changed) {
      await prisma.archiveItem.update({ where: { id: a.id }, data });
      console.log(`  ✅ Archive ${a.id}: images migrated`);
    }
  }

  // Family members
  const members = await prisma.familyMember.findMany({ select: { id: true, photo: true } });
  for (const m of members) {
    if (m.photo?.startsWith("data:")) {
      const url = await saveBase64(m.photo);
      if (url) {
        await prisma.familyMember.update({ where: { id: m.id }, data: { photo: url } });
        console.log(`  ✅ FamilyMember ${m.id}: photo migrated`);
      }
    }
  }

  // Memories
  const memories = await prisma.memory.findMany({ select: { id: true, image: true } });
  for (const m of memories) {
    if (m.image?.startsWith("data:")) {
      const url = await saveBase64(m.image);
      if (url) {
        await prisma.memory.update({ where: { id: m.id }, data: { image: url } });
        console.log(`  ✅ Memory ${m.id}: image migrated`);
      }
    }
  }

  // Messages
  const messages = await prisma.message.findMany({ select: { id: true, image: true } });
  for (const m of messages) {
    if (m.image?.startsWith("data:")) {
      const url = await saveBase64(m.image);
      if (url) {
        await prisma.message.update({ where: { id: m.id }, data: { image: url } });
        console.log(`  ✅ Message ${m.id}: image migrated`);
      }
    }
  }

  // Pets
  const pets = await prisma.pet.findMany({ select: { id: true, photo: true } });
  for (const p of pets) {
    if (p.photo?.startsWith("data:")) {
      const url = await saveBase64(p.photo);
      if (url) {
        await prisma.pet.update({ where: { id: p.id }, data: { photo: url } });
        console.log(`  ✅ Pet ${p.id}: photo migrated`);
      }
    }
  }

  // Pet photos
  const petPhotos = await prisma.petPhoto.findMany({ select: { id: true, url: true } });
  for (const p of petPhotos) {
    if (p.url?.startsWith("data:")) {
      const url = await saveBase64(p.url);
      if (url) {
        await prisma.petPhoto.update({ where: { id: p.id }, data: { url } });
        console.log(`  ✅ PetPhoto ${p.id}: url migrated`);
      }
    }
  }

  console.log("\n✅ Migration complete!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Migration failed:", e);
  prisma.$disconnect();
  process.exit(1);
});
