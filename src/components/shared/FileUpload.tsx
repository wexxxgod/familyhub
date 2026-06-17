"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface FileUploadProps {
  onUploadComplete: (urls: string[]) => void;
  label?: string;
  multiple?: boolean;
}

export function FileUpload({ onUploadComplete, label, multiple }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of acceptedFiles) {
        const res = await api.upload.file(file);
        urls.push(res.url);
      }
      onUploadComplete(urls);
      toast.success("Файл загружен");
    } catch {
      toast.error("Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: multiple ? 10 : 1,
    maxSize: 8 * 1024 * 1024,
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
