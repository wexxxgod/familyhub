"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadThing } from "@/lib/uploadthing";
import toast from "react-hot-toast";

interface FileUploadProps {
  endpoint: "imageUploader" | "attachmentUploader";
  onUploadComplete: (urls: string[]) => void;
  label?: string;
}

export function FileUpload({ endpoint, onUploadComplete, label }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { startUpload } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      const urls = res.map((r) => r.url);
      onUploadComplete(urls);
      setUploading(false);
      toast.success("Файл загружен");
    },
    onUploadError: () => {
      toast.error("Ошибка загрузки");
      setUploading(false);
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    await startUpload(acceptedFiles);
  }, [startUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: endpoint === "imageUploader" ? 5 : 10,
    maxSize: endpoint === "imageUploader" ? 8 * 1024 * 1024 : 32 * 1024 * 1024,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
        isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      }`}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-sm text-muted-foreground">Загрузка...</span>
        </div>
      ) : (
        <div>
          <svg className="mx-auto mb-2 text-muted-foreground" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="text-sm text-muted-foreground">
            {label || "Перетащите файлы или нажмите для выбора"}
          </p>
        </div>
      )}
    </div>
  );
}
