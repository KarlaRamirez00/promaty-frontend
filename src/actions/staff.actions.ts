import {
  createStaffApi,
  getStaffApi,
  listAfpOptionsApi,
  listBankOptionsApi,
  listComunaOptionsApi,
  listEducationLevelOptionsApi,
  listHealthSystemOptionsApi,
  listMaritalStatusOptionsApi,
  listNationalityOptionsApi,
  listProvinciaOptionsApi,
  listRegionOptionsApi,
  listRegisteredSexOptionsApi,
  listStaffApi,
  updateStaffApi,
} from '@/services'
import {
  mapperStaffDetail,
  mapperStaffFormToCreatePayload,
  mapperStaffFormToPayload,
  mapperStaffList,
} from '@/mappers'
import { useGetDetail, useGetTable, useMutateForm } from '@/utils'
import type { StaffForm, StaffQueryParams } from '@/models'

export function getStaffListAction(params: StaffQueryParams) {
  return useGetTable(listStaffApi, params, mapperStaffList)
}

export function getStaffDetailAction(id: number) {
  return useGetDetail(getStaffApi, id, mapperStaffDetail)
}

export function createStaffAction(form: StaffForm) {
  return useMutateForm(createStaffApi, form, mapperStaffFormToCreatePayload)
}

export function updateStaffAction(form: StaffForm) {
  return useMutateForm(
    (payload) => updateStaffApi(form.id as number, payload),
    form,
    mapperStaffFormToPayload,
  )
}

export function getRegisteredSexOptionsAction() {
  return listRegisteredSexOptionsApi()
}

export function getMaritalStatusOptionsAction() {
  return listMaritalStatusOptionsApi()
}

export function getNationalityOptionsAction() {
  return listNationalityOptionsApi()
}

export function getEducationLevelOptionsAction() {
  return listEducationLevelOptionsApi()
}

export function getAfpOptionsAction() {
  return listAfpOptionsApi()
}

export function getHealthSystemOptionsAction() {
  return listHealthSystemOptionsApi()
}

export function getRegionOptionsAction() {
  return listRegionOptionsApi()
}

export function getProvinciaOptionsAction(regionId: number) {
  return listProvinciaOptionsApi(regionId)
}

export function getComunaOptionsAction(provinciaId: number) {
  return listComunaOptionsApi(provinciaId)
}

export function getBankOptionsAction() {
  return listBankOptionsApi()
}
