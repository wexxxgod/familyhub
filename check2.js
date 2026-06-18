const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "nikitagg2610@mail.ru" },
      select: { id: true, email: true, name: true, role: true, familyId: true, passwordHash: true, image: true, createdAt: true }
    });
    console.log("Has password:", !!user.passwordHash);
    console.log("Image length:", user.image ? user.image.length : 0);
    console.log(JSON.stringify(user, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}
main().catch(console.error);
