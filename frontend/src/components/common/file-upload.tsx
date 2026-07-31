"use client";

import { Button } from "@/components/ui/button";
import { FILE_UPLOAD_ACCEPT, FILE_UPLOAD_MAX_MB } from "@/types/attachments";
import { FileText, ImageIcon, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSizeMb?: number;
  disabled?: boolean;
  label?: string;
}

export function FileUpload({
  onFileSelect,
  accept = FILE_UPLOAD_ACCEPT,
  maxSizeMb = FILE_UPLOAD_MAX_MB,
  disabled = false,
  label,
}: FileUploadProps) {
  const t = useTranslations("attachments");
  const tValidation = useTranslations("validation");
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resolvedLabel = label ?? t("chooseFile");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setError(null);

    if (!file) {
      setSelected(null);
      setPreview(null);
      onFileSelect(null);
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(tValidation("fileTooLarge", { maxSizeMb }));
      e.target.value = "";
      return;
    }

    setSelected(file);
    onFileSelect(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const clear = () => {
    setSelected(null);
    setPreview(null);
    setError(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={handleChange}
      />

      {!selected ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent/50 disabled:opacity-50"
        >
          <Upload className="h-8 w-8" />
          <span>{resolvedLabel}</span>
          <span className="text-xs">{t("hint", { maxSizeMb })}</span>
        </button>
      ) : (
        <div className="flex items-start gap-3 rounded-lg border p-3">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={t("previewAlt")} className="h-16 w-16 rounded object-cover" />
          ) : selected.type.startsWith("image/") ? (
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          ) : (
            <FileText className="h-10 w-10 text-muted-foreground" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{selected.name}</p>
            <p className="text-xs text-muted-foreground">
              {t("sizeKb", { n: (selected.size / 1024).toFixed(1) })}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={clear} disabled={disabled}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
