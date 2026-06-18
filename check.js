const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({
      where: { email: "nik.gudkov.2006@inbox.ru" },
      include: { family: true },
    });
    console.log(JSON.stringify(user, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
