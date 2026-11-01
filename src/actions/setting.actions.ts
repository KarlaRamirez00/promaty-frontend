import { listSettingsApi, updateSettingApi } from '@/services'
import { mapperSettingFormToPayload, mapperSettingGroups } from '@/mappers'
import { useGetDetail, useMutateForm } from '@/utils'
import type { SettingForm } from '@/models'

export function getSettingListAction() {
  return useGetDetail(listSettingsApi, undefined, mapperSettingGroups)
}

export function updateSettingAction(form: SettingForm) {
  return useMutateForm(
    (payload) => updateSettingApi(form.key, payload),
    form,
    mapperSettingFormToPayload,
  )
}
