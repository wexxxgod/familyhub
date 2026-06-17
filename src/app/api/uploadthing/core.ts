import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getCurrentUser } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 5 } })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  attachmentUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "32MB", maxFileCount: 3 },
    pdf: { maxFileSize: "8MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
