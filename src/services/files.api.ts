import { rrhhApi } from '@/lib/http'

// La descarga exige el token, por eso no se usa un enlace directo: se pide el binario por axios.
export async function downloadFileApi(mediaFileId: string): Promise<Blob> {
  const response = await rrhhApi.get<Blob>(`/files/${mediaFileId}`, { responseType: 'blob' })
  return response.data
}
