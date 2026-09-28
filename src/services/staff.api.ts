import { rrhhApi, unwrap, unwrapPage } from '@/lib/http'
import type { ApiListResponse, ApiResponse, PageResult } from '@/types/api'
import type {
  BankOptionRaw,
  CatalogOptionRaw,
  StaffCreatePayload,
  StaffFormPayload,
  StaffListRaw,
  StaffRaw,
} from '@/types/staff'
import type { StaffQueryParams } from '@/models'

export async function listStaffApi(params: StaffQueryParams): Promise<PageResult<StaffListRaw>> {
  const response = await rrhhApi.get<ApiListResponse<StaffListRaw>>('/staff', {
    params: {
      search: params.search || undefined,
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

export async function createStaffApi(payload: StaffCreatePayload): Promise<number> {
  const response = await rrhhApi.post<ApiResponse<number>>('/staff', payload)
  return unwrap(response)
}

export async function updateStaffApi(id: number, payload: StaffFormPayload): Promise<StaffRaw> {
  const response = await rrhhApi.put<ApiResponse<StaffRaw>>(`/staff/${id}`, payload)
  return unwrap(response)
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

export async function listBankOptionsApi(): Promise<BankOptionRaw[]> {
  const response = await rrhhApi.get<ApiListResponse<BankOptionRaw>>('/banks')
  return response.data.data
}


// ==========================================
// Endpoints de Selectores estáticos (mocks)
// ==========================================