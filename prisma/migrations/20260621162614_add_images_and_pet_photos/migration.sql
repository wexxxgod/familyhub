-- AlterTable
ALTER TABLE "posts" ADD COLUMN "images" TEXT[] NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "archive_items" ADD COLUMN "images" TEXT[] NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE "pet_photos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "petId" TEXT NOT NULL,

    CONSTRAINT "pet_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pet_photos_petId_idx" ON "pet_photos"("petId");

-- AddForeignKey
ALTER TABLE "pet_photos" ADD CONSTRAINT "pet_photos_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
