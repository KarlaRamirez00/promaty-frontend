import type { FileAttachmentRaw } from '@/types/attachment'
import type { FileAttachment } from '@/models'
import { formatDateTime, formatFileSize } from '@/utils'

export function mapperAttachments(items: FileAttachmentRaw[] | null | undefined): FileAttachment[] {
  return (items ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    fileType: item.fileType,
    fileSizeLabel: formatFileSize(item.fileSize),
    mediaFileId: item.mediaFileId,
    updatedAt: formatDateTime(item.updatedAt),
  }))
}
