import type { AttachmentRequirementRaw } from '@/types/attachment'

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

// Formatos del servicio de adjuntos compartido de backend.
const ATTACHMENT_FORMATS = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']

export const STAFF_ATTACHMENT_RULE: AttachmentRule = {
  maxFiles: 1,
  formats: ATTACHMENT_FORMATS,
}

// Contratos además acepta planillas Excel.
export const CONTRACT_ATTACHMENT_RULE: AttachmentRule = {
  maxFiles: 1,
  formats: [...ATTACHMENT_FORMATS, 'xls', 'xlsx'],
}

export const TERMINATION_ATTACHMENT_RULE: AttachmentRule = {
  maxFiles: 1,
  formats: ATTACHMENT_FORMATS,
}

export const ANNEX_ATTACHMENT_RULE: AttachmentRule = {
  maxFiles: 1,
  formats: ATTACHMENT_FORMATS,
}

export type AttachmentRequirement = AttachmentRequirementRaw

export type AttachmentSubmitItem =
  | { id: number; name: string }
  | { file: File; name?: string; type?: string }
