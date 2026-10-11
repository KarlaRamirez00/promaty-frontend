import {
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
} from '@/services'
import {
  mapperContractCatalogOptions,
  mapperContractDetail,
  mapperContractFormToPayload,
  mapperContractList,
  mapperContractStaffOptions,
} from '@/mappers'
import { useGetDetail, useGetTable, useMutateForm } from '@/utils'
import type { ContractForm, ContractQueryParams } from '@/models'

export function getContractListAction(params: ContractQueryParams) {
  return useGetTable(listContractsApi, params, mapperContractList)
}

export function getContractDetailAction(id: number) {
  return useGetDetail(getContractApi, id, mapperContractDetail)
}

export function getContractStatusOptionsAction() {
  return listContractStatusOptionsApi()
}

export function createContractRequestAction(form: ContractForm) {
  return useMutateForm(createContractRequestApi, form, mapperContractFormToPayload)
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
