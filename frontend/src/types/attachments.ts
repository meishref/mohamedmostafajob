export interface Attachment {
  id: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  is_image: boolean;
  url: string | null;
  uploader?: { id: string; name: string } | null;
  created_at: string;
}

export type AttachmentResource = "employees" | "payments" | "expenses" | "tasks";

export const FILE_UPLOAD_ACCEPT =
  "image/*,.pdf,.xlsx,.xls,.csv,.doc,.docx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const FILE_UPLOAD_MAX_MB = 10;
