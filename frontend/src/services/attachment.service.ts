import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { Attachment, AttachmentResource } from "@/types/attachments";

const resourcePaths: Record<AttachmentResource, string> = {
  employees: "employees",
  payments: "payments",
  expenses: "expenses",
  tasks: "tasks",
};

export const attachmentService = {
  async list(resource: AttachmentResource, id: string): Promise<Attachment[]> {
    const path = resourcePaths[resource];
    const { data } = await apiClient.get<ApiResponse<Attachment[]>>(`/${path}/${id}/attachments`);
    return data.data;
  },

  async upload(resource: AttachmentResource, id: string, file: File): Promise<Attachment> {
    const path = resourcePaths[resource];
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<ApiResponse<{ attachment: Attachment }>>(
      `/${path}/${id}/attachments`,
      formData,
    );
    return data.data.attachment;
  },

  async download(id: string, filename: string): Promise<void> {
    const response = await apiClient.get(`/attachments/${id}/download`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/attachments/${id}`);
  },
};
