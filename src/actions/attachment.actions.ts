import { downloadFileApi } from '@/services'
import type { FileAttachment } from '@/models'

export async function downloadAttachmentAction(attachment: FileAttachment): Promise<void> {
  const blob = await downloadFileApi(attachment.mediaFileId)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = attachment.name
  link.click()
  URL.revokeObjectURL(url)
}
