import type { AnnulPayload } from '@/types/annul'
import type { AnnulForm } from '@/models'

export function mapperAnnulPayload(form: AnnulForm): AnnulPayload {
  return { reason: form.reason.trim() }
}
