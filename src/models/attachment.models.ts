export interface FileAttachment {
  id: number
  name: string
  fileType: string
  fileSizeLabel: string
  mediaFileId: string
  updatedAt: string
}

export interface AttachmentRule {
  maxFiles: number | null
  formats: string[]
}

// Límite configurado en backend; el cliente lo valida solo para avisar antes de subir.
export const ATTACHMENT_MAX_SIZE_MB = 20

export const STAFF_ATTACHMENT_RULE: AttachmentRule = {
  maxFiles: 1,
  formats: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
}
