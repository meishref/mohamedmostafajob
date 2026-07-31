"use client";

import { FileUpload } from "@/components/common/file-upload";
import { useConfirm } from "@/components/common/confirm-dialog-provider";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { attachmentService } from "@/services/attachment.service";
import { useAttachments, useDeleteAttachment, useUploadAttachment } from "@/hooks/use-attachments";
import type { AttachmentResource } from "@/types/attachments";
import { Download, FileText, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface AttachmentManagerProps {
  resource: AttachmentResource;
  resourceId: string;
  canUpload?: boolean;
  canDelete?: boolean;
  title?: string;
}

export function AttachmentManager({
  resource,
  resourceId,
  canUpload = true,
  canDelete = true,
  title,
}: AttachmentManagerProps) {
  const t = useTranslations("attachments");
  const tCommon = useTranslations("common");
  const tConfirm = useTranslations("confirm");
  const { data: attachments = [], isLoading } = useAttachments(resource, resourceId);
  const upload = useUploadAttachment(resource, resourceId);
  const deleteAttachment = useDeleteAttachment(resource, resourceId);
  const confirm = useConfirm();

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return t("sizeBytes", { n: bytes });
    if (bytes < 1024 * 1024) return t("sizeKb", { n: (bytes / 1024).toFixed(1) });
    return t("sizeMb", { n: (bytes / (1024 * 1024)).toFixed(1) });
  };

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    try {
      await upload.mutateAsync(file);
      toast.success(t("toast.uploaded"));
    } catch {
      toast.error(t("toast.uploadFailed"));
    }
  };

  const handleDownload = async (id: string, name: string) => {
    try {
      await attachmentService.download(id, name);
    } catch {
      toast.error(t("toast.downloadFailed"));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: t("deleteConfirm.title"),
      description: t("deleteConfirm.description", { name }),
      variant: "destructive",
      confirmLabel: tConfirm("delete"),
    });
    if (!confirmed) return;
    try {
      await deleteAttachment.mutateAsync(id);
      toast.success(t("toast.deleted"));
    } catch {
      toast.error(t("toast.deleteFailed"));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title ?? t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {canUpload && (
          <FileUpload
            onFileSelect={handleUpload}
            disabled={upload.isPending}
            label={t("upload")}
          />
        )}

        {isLoading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        ) : attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {attachments.map((file) => (
              <li key={file.id} className="flex items-center gap-3 p-3">
                {file.is_image && file.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={file.url} alt={file.original_name} className="h-12 w-12 rounded object-cover" />
                ) : (
                  <FileText className="h-10 w-10 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.original_name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(file.file_size)}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(file.id, file.original_name)}
                    aria-label={tCommon("download")}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(file.id, file.original_name)}
                      disabled={deleteAttachment.isPending}
                      aria-label={tCommon("delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
