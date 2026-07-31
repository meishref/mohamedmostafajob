"use client";

import { attachmentService } from "@/services/attachment.service";
import type { AttachmentResource } from "@/types/attachments";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const attachmentKeys = {
  all: ["attachments"] as const,
  list: (resource: AttachmentResource, id: string) =>
    [...attachmentKeys.all, resource, id] as const,
};

export function useAttachments(resource: AttachmentResource, id: string, enabled = true) {
  return useQuery({
    queryKey: attachmentKeys.list(resource, id),
    queryFn: () => attachmentService.list(resource, id),
    enabled: enabled && id.length > 0,
  });
}

export function useUploadAttachment(resource: AttachmentResource, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => attachmentService.upload(resource, id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(resource, id) });
    },
  });
}

export function useDeleteAttachment(resource: AttachmentResource, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: string) => attachmentService.delete(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(resource, id) });
    },
  });
}
