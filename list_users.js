const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, familyId: true, createdAt: true }
    });
    console.log(JSON.stringify(users, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}
main().catch(console.error);
