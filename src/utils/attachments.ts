import type { AttachmentSubmitItem } from '@/models/attachment.models'

// Con `items` en null no se envía `attachments` y backend deja los adjuntos como están.
// Sin Content-Type explícito, para que el navegador agregue el boundary.
export function buildMultipartBody(data: object, items: AttachmentSubmitItem[] | null): FormData {
  const files: File[] = []
  const attachments = (items ?? []).map((item) => {
    if ('id' in item) return { id: item.id, name: item.name }
    const index = files.push(item.file) - 1
    return { fileIndex: index, name: item.name ?? item.file.name, type: item.type }
  })

  const body = new FormData()
  const payload = items === null ? data : { ...data, attachments }
  body.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
  for (const file of files) body.append('files', file)
  return body
}
