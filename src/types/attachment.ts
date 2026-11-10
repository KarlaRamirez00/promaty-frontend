export interface FileAttachmentRaw {
  id: number
  // Nombre original del archivo.
  name: string
  // Content-type, ej. "application/pdf".
  fileType: string
  // Tamaño en bytes.
  fileSize: number
  downloadUrl: string
  // UUID del archivo; es el que se usa para pedir la descarga.
  mediaFileId: string
  updatedAt: string
}
