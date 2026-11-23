import {
  annulContractApi,
  createContractRequestApi,
  getContractApi,
  listCompanyOptionsApi,
  listContractsApi,
  listContractStatusOptionsApi,
  listContractProjectOptionsApi,
  listContractStaffOptionsApi,
  listContractTypeOptionsApi,
  listJobTitleOptionsApi,
  listMealTypeOptionsApi,
  listSiteOptionsApi,
  listTransportTypeOptionsApi,
  updateContractApi,
} from '@/services'
import {
  mapperAnnulPayload,
  mapperContractCatalogOptions,
  mapperContractDetail,
  mapperContractEditData,
  mapperContractFormToPayload,
  mapperContractFormToUpdatePayload,
  mapperContractList,
  mapperContractStaffOptions,
} from '@/mappers'
import { useGetDetail, useGetTable, useMutateForm } from '@/utils'
import type { AnnulForm, AttachmentSubmitItem, ContractForm, ContractQueryParams } from '@/models'

export function annulContractAction(id: number, form: AnnulForm) {
  return useMutateForm((payload) => annulContractApi(id, payload), form, mapperAnnulPayload)
}

export function getContractListAction(params: ContractQueryParams) {
  return useGetTable(listContractsApi, params, mapperContractList)
}

export function getContractDetailAction(id: number) {
  return useGetDetail(getContractApi, id, mapperContractDetail)
}

export function getContractEditDataAction(id: number) {
  return useGetDetail(getContractApi, id, mapperContractEditData)
}

export function getContractStatusOptionsAction() {
  return listContractStatusOptionsApi()
}

export function createContractRequestAction(form: ContractForm, attachments: AttachmentSubmitItem[]) {
  return useMutateForm(
    (payload) => createContractRequestApi(payload, attachments),
    form,
    mapperContractFormToPayload,
  )
}

export function updateContractAction(form: ContractForm, attachments: AttachmentSubmitItem[]) {
  return useMutateForm(
    (payload) => updateContractApi(form.id as number, payload, attachments),
    form,
    mapperContractFormToUpdatePayload,
  )
}

export function getContractProjectOptionsAction() {
  return listContractProjectOptionsApi()
}

export async function getCompanyOptionsAction() {
  return mapperContractCatalogOptions(await listCompanyOptionsApi())
}

export async function getContractTypeOptionsAction() {
  return mapperContractCatalogOptions(await listContractTypeOptionsApi())
}

export async function getJobTitleOptionsAction() {
  return mapperContractCatalogOptions(await listJobTitleOptionsApi())
}

export async function getSiteOptionsAction() {
  return mapperContractCatalogOptions(await listSiteOptionsApi())
}

export async function getMealTypeOptionsAction() {
  return mapperContractCatalogOptions(await listMealTypeOptionsApi())
}

export async function getTransportTypeOptionsAction() {
  return mapperContractCatalogOptions(await listTransportTypeOptionsApi())
}

export async function getContractStaffOptionsAction() {
  return mapperContractStaffOptions(await listContractStaffOptionsApi())
}
