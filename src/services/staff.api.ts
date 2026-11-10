import { rrhhApi, unwrap, unwrapPage } from '@/lib/http'
import type { ApiListResponse, ApiResponse, PageResult } from '@/types/api'
import type {
  BankOptionRaw,
  CatalogOptionRaw,
  StaffCreatePayload,
  StaffFormPayload,
  StaffListRaw,
  StaffRaw,
  StaffStatusPayload,
} from '@/types/staff'
import type { StaffQueryParams } from '@/models'

export async function listStaffApi(params: StaffQueryParams): Promise<PageResult<StaffListRaw>> {
  const response = await rrhhApi.get<ApiListResponse<StaffListRaw>>('/staff', {
    params: {
      search: params.search || undefined,
      statusCode: params.statusCode ?? undefined,
      costCenterCode: params.costCenterCode ?? undefined,
      page: params.page - 1,
      size: params.size,
      sort: `${params.sort.key},${params.sort.order}`,
    },
  })
  return unwrapPage(response)
}

export async function getStaffApi(id: number): Promise<StaffRaw> {
  const response = await rrhhApi.get<ApiResponse<StaffRaw>>(`/staff/${id}`)
  return unwrap(response)
}

// Crear y editar viajan como multipart: `data` lleva el JSON del formulario y `file` el adjunto, si hay.
// Sin Content-Type explícito, el navegador agrega el boundary.
function toStaffFormData(payload: StaffFormPayload, file: File | null): FormData {
  const body = new FormData()
  body.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
  if (file) body.append('file', file)
  return body
}

export async function createStaffApi(payload: StaffCreatePayload, file: File | null): Promise<number> {
  const response = await rrhhApi.post<ApiResponse<number>>('/staff', toStaffFormData(payload, file))
  return unwrap(response)
}

export async function updateStaffApi(
  id: number,
  payload: StaffFormPayload,
  file: File | null,
): Promise<StaffRaw> {
  const response = await rrhhApi.put<ApiResponse<StaffRaw>>(
    `/staff/${id}`,
    toStaffFormData(payload, file),
  )
  return unwrap(response)
}

export async function updateStaffStatusApi(id: number, payload: StaffStatusPayload): Promise<void> {
  await rrhhApi.patch(`/staff/${id}/status`, payload)
}

export async function deleteStaffAttachmentApi(id: number, attachmentId: number): Promise<void> {
  await rrhhApi.delete(`/staff/${id}/attachments/${attachmentId}`)
}

export async function listStaffStatusOptionsApi(): Promise<CatalogOptionRaw[]> {
  const response = await rrhhApi.get<ApiListResponse<CatalogOptionRaw>>('/platformStatuses', {
    params: { subModule: 'staff' },
  })
  return response.data.data
}

// ==========================================
// Endpoints de Selectores
// ==========================================
// Catálogos de solo lectura, sin paginar, propios de la ficha de Staff — ninguno se usa en otro
// dominio, por eso viven acá en vez de en un selectors.api.ts genérico (ver ARQUITECTURA-FRONTEND.md).

async function listCatalogOptions(path: string): Promise<CatalogOptionRaw[]> {
  const response = await rrhhApi.get<ApiListResponse<CatalogOptionRaw>>(path)
  return response.data.data
}

export function listRegisteredSexOptionsApi(): Promise<CatalogOptionRaw[]> {
  return listCatalogOptions('/registeredSexes')
}

export function listMaritalStatusOptionsApi(): Promise<CatalogOptionRaw[]> {
  return listCatalogOptions('/maritalStatuses')
}

export function listNationalityOptionsApi(): Promise<CatalogOptionRaw[]> {
  return listCatalogOptions('/nationalities')
}

export function listEducationLevelOptionsApi(): Promise<CatalogOptionRaw[]> {
  return listCatalogOptions('/educationLevels')
}

export function listAfpOptionsApi(): Promise<CatalogOptionRaw[]> {
  return listCatalogOptions('/afps')
}

export function listHealthSystemOptionsApi(): Promise<CatalogOptionRaw[]> {
  return listCatalogOptions('/healthSystems')
}

export function listRegionOptionsApi(): Promise<CatalogOptionRaw[]> {
  return listCatalogOptions('/regions')
}

export async function listProvinciaOptionsApi(regionId: number): Promise<CatalogOptionRaw[]> {
  const response = await rrhhApi.get<ApiListResponse<CatalogOptionRaw>>('/provincias', {
    params: { regionId },
  })
  return response.data.data
}

export async function listComunaOptionsApi(provinciaId: number): Promise<CatalogOptionRaw[]> {
  const response = await rrhhApi.get<ApiListResponse<CatalogOptionRaw>>('/comunas', {
    params: { provinciaId },
  })
  return response.data.data
}

export async function listBankOptionsApi(): Promise<BankOptionRaw[]> {
  const response = await rrhhApi.get<ApiListResponse<BankOptionRaw>>('/banks')
  return response.data.data
}


// ==========================================
// Endpoints de Selectores estáticos (mocks)
// ==========================================