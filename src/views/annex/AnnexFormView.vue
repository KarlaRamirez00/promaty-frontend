<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { mdiArrowDownCircleOutline, mdiContentSave } from '@mdi/js'
import {
  createAnnexRequestAction,
  downloadAttachmentAction,
  getAnnexableStaffOptionsAction,
  getAnnexEditDataAction,
  getAnnexTypeOptionsAction,
  getJobTitleOptionsAction,
  getSiteOptionsAction,
  updateAnnexAction,
} from '@/actions'
import { useBackendFieldErrors } from '@/composables/useBackendFieldErrors'
import { useMessage } from '@/composables/useMessage'
import { mapperAnnexContractInfoItems } from '@/mappers'
import { parseCurrency } from '@/utils'
import messages from '@/messages'
import annexMessages from '@/messages/annex.messages'
import { ROUTE } from '@/router/route-names'
import {
  ANNEX_ATTACHMENT_RULE,
  ANNEX_FIELDS_BY_TYPE,
  ANNEX_TYPE_CODE,
  CONTRACT_TYPE_FIXED_TERM_CODE,
  CONTRACT_TYPE_INDEFINITE_CODE,
  createAnnexForm,
  WEEKLY_WORK_HOURS_OPTIONS,
  WORK_DAYS_OPTIONS,
  WORKFLOW_QUERY_KEYS,
  type AnnexAttachment,
  type AnnexChangeField,
  type AnnexForm,
  type AttachmentSubmitItem,
} from '@/models'
import { annexDescriptionRules, firstError } from '@/rules'
import ErrorComponent from '@/components/common/ErrorComponent.vue'
import FieldErrorComponent from '@/components/common/FieldErrorComponent.vue'
import AlertComponent from '@/components/common/AlertComponent.vue'
import AttachmentField from '@/components/common/AttachmentField.vue'
import StaffInfoCard from '@/components/common/StaffInfoCard.vue'
import DateField from '@/components/common/DateField.vue'

const props = defineProps<{
  id?: string
}>()

const router = useRouter()
const queryClient = useQueryClient()
const { toastSaved, toastFailed } = useMessage()
const {
  backendErrorFields,
  setFromError,
  clear: clearBackendErrors,
  hasBackendError,
} = useBackendFieldErrors()

const annexId = computed(() => (props.id ? Number(props.id) : null))
const isEditing = computed(() => annexId.value !== null)

const { data: editData } = useQuery({
  queryKey: computed(() => ['annexes', 'editData', annexId.value]),
  queryFn: () => {
    const id = annexId.value
    if (id === null) throw new Error('Falta el id para cargar los datos')
    return getAnnexEditDataAction(id)
  },
  enabled: isEditing,
})
const { data: staffOptions } = useQuery({
  queryKey: ['staff', 'annexableOptions'],
  queryFn: getAnnexableStaffOptionsAction,
  enabled: computed(() => !isEditing.value),
})
const { data: typeOptions } = useQuery({
  queryKey: ['annexTypes', 'options'],
  queryFn: getAnnexTypeOptionsAction,
})
const { data: jobTitleOptions } = useQuery({
  queryKey: ['jobTitles', 'options'],
  queryFn: getJobTitleOptionsAction,
})
const { data: siteOptions } = useQuery({
  queryKey: ['sites', 'options'],
  queryFn: getSiteOptionsAction,
})

const form = ref<AnnexForm>(createAnnexForm())
const fieldErrors = ref<Record<string, string>>({})
const hasSubmitted = ref(false)
const pendingFile = ref<File[]>([])
const savedAttachments = ref<AnnexAttachment[]>([])

watch(
  editData,
  (data) => {
    if (!data) return
    form.value = { ...data.form }
    savedAttachments.value = [...data.attachments]
  },
  { immediate: true },
)

const contract = computed(() =>
  isEditing.value
    ? (editData.value?.contract ?? null)
    : (staffOptions.value?.find((option) => option.id === form.value.staffId)?.contract ?? null),
)

const staffInfo = computed(() => {
  if (!contract.value) return null
  const selected = staffOptions.value?.find((option) => option.id === form.value.staffId)
  return {
    name: selected?.name ?? editData.value?.staffName ?? '',
    identification: selected?.identification ?? editData.value?.staffIdentification ?? '',
    items: mapperAnnexContractInfoItems(contract.value),
  }
})

// Prórroga solo aplica a plazo fijo y la conversión no aplica a un contrato que ya es indefinido.
const typeItems = computed(() => {
  const items: { id: number; name: string; code: string; props?: { disabled: boolean } }[] = (
    typeOptions.value ?? []
  ).filter(({ code }) => {
    const contractType = contract.value?.contractTypeCode
    if (!contractType) return false
    if (code === ANNEX_TYPE_CODE.EXTENSION) return contractType === CONTRACT_TYPE_FIXED_TERM_CODE
    if (code === ANNEX_TYPE_CODE.CONVERSION) return contractType !== CONTRACT_TYPE_INDEFINITE_CODE
    return true
  })
  const current = editData.value?.currentType
  if (current && !items.some((item) => item.id === current.id)) {
    items.push({ ...current, props: { disabled: true } })
  }
  return items
})

const selectedTypeCode = computed(
  () => typeItems.value.find((type) => type.id === form.value.annexTypeId)?.code ?? '',
)
const activeFields = computed<AnnexChangeField[]>(() => ANNEX_FIELDS_BY_TYPE[selectedTypeCode.value] ?? [])

function showField(field: AnnexChangeField): boolean {
  return activeFields.value.includes(field)
}

const NEW_FIELD_RESETS: Record<AnnexChangeField, () => void> = {
  newEndDate: () => (form.value.newEndDate = null),
  newBaseSalary: () => (form.value.newBaseSalary = ''),
  newJobTitleId: () => (form.value.newJobTitleId = null),
  newWeeklyWorkHours: () => (form.value.newWeeklyWorkHours = null),
  newWorkDays: () => (form.value.newWorkDays = null),
  newSiteId: () => (form.value.newSiteId = null),
}

// Backend rechaza los campos que no corresponden al tipo, por eso se vacían al cambiar de tipo.
watch(selectedTypeCode, () => {
  for (const [field, reset] of Object.entries(NEW_FIELD_RESETS)) {
    if (!showField(field as AnnexChangeField)) {
      reset()
      delete fieldErrors.value[field]
    }
  }
  delete fieldErrors.value.schedule
})

watch(
  () => form.value.staffId,
  () => {
    if (isEditing.value) return
    form.value.annexTypeId = null
  },
)

const jobTitleItems = computed(() =>
  (jobTitleOptions.value ?? []).map((option) => ({
    ...option,
    props: { disabled: option.id === contract.value?.jobTitle.id },
  })),
)
const siteItems = computed(() =>
  (siteOptions.value ?? []).map((option) => ({
    ...option,
    props: { disabled: option.id === contract.value?.site.id },
  })),
)

function removeSavedAttachment(attachment: { id: number }) {
  savedAttachments.value = savedAttachments.value.filter((item) => item.id !== attachment.id)
}

function attachmentItems(): AttachmentSubmitItem[] {
  return [
    ...savedAttachments.value.map(({ id, name }) => ({ id, name })),
    ...pendingFile.value.map((file) => ({ file })),
  ]
}

function hasError(field: string): boolean {
  return !!fieldErrors.value[field] || hasBackendError(field)
}

const hasValidationError = computed(() => hasSubmitted.value && Object.keys(fieldErrors.value).length > 0)
const alert = computed(() => {
  if (hasValidationError.value) return annexMessages.alertError
  return isEditing.value ? annexMessages.alertEdit : annexMessages.alertInfo
})

function goToAnnexes() {
  void router.push({ name: ROUTE.ANNEX_LIST })
}

function validateChangeFields(value: AnnexForm): Record<string, string> {
  const rules = annexMessages.rules
  const errors: Record<string, string> = {}
  const current = contract.value

  if (showField('newEndDate')) {
    if (!value.newEndDate) errors.newEndDate = rules.newEndDateRequired
    else if (current?.endDateIso && value.newEndDate <= current.endDateIso) {
      errors.newEndDate = rules.newEndDateAfterCurrent
    }
  }
  if (showField('newBaseSalary')) {
    if (!value.newBaseSalary) errors.newBaseSalary = rules.newBaseSalaryRequired
    else if (current && parseCurrency(value.newBaseSalary) <= current.baseSalaryValue) {
      errors.newBaseSalary = rules.newBaseSalaryGreater
    }
  }
  if (showField('newJobTitleId') && !value.newJobTitleId) errors.newJobTitleId = rules.newJobTitleRequired
  if (
    showField('newSiteId') &&
    !value.newWeeklyWorkHours &&
    !value.newWorkDays &&
    !value.newSiteId
  ) {
    errors.schedule = rules.scheduleOrSiteRequired
  }
  return errors
}

function validate(): boolean {
  const rules = annexMessages.rules
  const value = form.value
  const errors: Record<string, string> = {}

  if (!isEditing.value && !value.staffId) errors.staffId = rules.staffRequired
  if (!value.annexTypeId) errors.annexTypeId = rules.annexTypeRequired
  if (!value.effectiveDate) errors.effectiveDate = rules.effectiveDateRequired
  if (!value.description.trim()) errors.description = rules.descriptionRequired
  else {
    const descriptionError = firstError(value.description, annexDescriptionRules)
    if (descriptionError) errors.description = descriptionError
  }

  fieldErrors.value = { ...errors, ...validateChangeFields(value) }
  return Object.keys(fieldErrors.value).length === 0
}

async function saveAnnex(value: AnnexForm): Promise<void> {
  if (value.id) {
    await updateAnnexAction(value, attachmentItems())
  } else {
    await createAnnexRequestAction(value, attachmentItems())
  }
}

const saveMutation = useMutation({
  mutationFn: saveAnnex,
  onSuccess: (_data, value) => {
    toastSaved(value.id, messages.annex)
    goToAnnexes()
    void queryClient.invalidateQueries({
      predicate: ({ queryKey }) => WORKFLOW_QUERY_KEYS.has(queryKey[0]),
      refetchType: 'none',
    })
  },
  onError: (error: unknown) => {
    if (!setFromError(error)) toastFailed(messages.annex)
  },
})

function submit() {
  hasSubmitted.value = true
  clearBackendErrors()
  if (!validate()) return
  saveMutation.mutate(form.value)
}
</script>

<template>
  <h1 class="text-h5 font-weight-bold mb-4">{{ isEditing ? 'Editar anexo' : 'Nuevo anexo' }}</h1>

  <AlertComponent
    :type="hasValidationError ? 'error' : 'info'"
    :message="alert.message"
    :icon="mdiArrowDownCircleOutline"
  />

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-2 mb-4">Colaborador</h2>

  <v-row>
    <v-col cols="12">
      <div v-if="isEditing" class="field-locked">
        <v-text-field
          v-model="form.staffLabel"
          v-input-mask="'freeText'"
          label="Colaborador"
          variant="outlined"
          density="comfortable"
          :loading="!editData"
          disabled
          hide-details
        />
      </div>
      <template v-else>
        <v-autocomplete
          v-model="form.staffId"
          data-testid="annex-staff"
          :items="staffOptions ?? []"
          item-title="title"
          item-value="id"
          label="Colaborador"
          placeholder="Seleccionar"
          variant="outlined"
          density="comfortable"
          :error="hasError('staffId')"
          hide-details="auto"
          persistent-placeholder
          autofocus
        />
        <FieldErrorComponent :message="fieldErrors.staffId" />
      </template>
    </v-col>

    <v-col v-if="staffInfo" cols="12">
      <StaffInfoCard
        :name="staffInfo.name"
        :identification="staffInfo.identification"
        :items="staffInfo.items"
      />
    </v-col>
  </v-row>

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-6 mb-4">Datos del anexo</h2>

  <v-row>
    <v-col cols="12" md="6">
      <v-select
        v-model="form.annexTypeId"
        data-testid="annex-type"
        :items="typeItems"
        item-title="name"
        item-value="id"
        label="Tipo de anexo"
        :placeholder="contract ? 'Seleccionar' : 'Selecciona primero un colaborador'"
        variant="outlined"
        density="comfortable"
        :disabled="!contract"
        :error="hasError('annexTypeId')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.annexTypeId" />
    </v-col>

    <v-col cols="12" md="6">
      <DateField
        v-model="form.effectiveDate"
        data-testid="annex-effective-date"
        label="Fecha de vigencia"
        :error="hasError('effectiveDate')"
        hide-details
      />
      <FieldErrorComponent :message="fieldErrors.effectiveDate" />
    </v-col>

    <v-col v-if="showField('newEndDate')" cols="12">
      <DateField
        v-model="form.newEndDate"
        label="Nueva fecha de término"
        :min-date="contract?.endDateIso ?? undefined"
        :error="hasError('newEndDate')"
        hide-details
      />
      <FieldErrorComponent :message="fieldErrors.newEndDate" />
    </v-col>

    <v-col v-if="showField('newBaseSalary')" cols="12">
      <v-text-field
        v-model="form.newBaseSalary"
        v-input-mask="'currency'"
        label="Nuevo sueldo base"
        prefix="$"
        placeholder="Ingresa el nuevo sueldo base"
        variant="outlined"
        density="comfortable"
        :error="hasError('newBaseSalary')"
        inputmode="numeric"
        maxlength="11"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.newBaseSalary" />
    </v-col>

    <v-col v-if="showField('newJobTitleId')" cols="12">
      <v-select
        v-model="form.newJobTitleId"
        :items="jobTitleItems"
        item-title="name"
        item-value="id"
        label="Nuevo cargo"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('newJobTitleId')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.newJobTitleId" />
    </v-col>

    <template v-if="showField('newSiteId')">
      <v-col cols="12" md="6">
        <v-select
          v-model="form.newWeeklyWorkHours"
          :items="WEEKLY_WORK_HOURS_OPTIONS"
          item-title="title"
          item-value="value"
          label="Nuevas horas semanales (opcional)"
          placeholder="Seleccionar"
          variant="outlined"
          density="comfortable"
          clearable
          :error="hasError('newWeeklyWorkHours') || !!fieldErrors.schedule"
          hide-details="auto"
          persistent-placeholder
        />
      </v-col>

      <v-col cols="12" md="6">
        <v-select
          v-model="form.newWorkDays"
          :items="WORK_DAYS_OPTIONS"
          item-title="title"
          item-value="value"
          label="Nuevos días de trabajo (opcional)"
          placeholder="Seleccionar"
          variant="outlined"
          density="comfortable"
          clearable
          :error="hasError('newWorkDays') || !!fieldErrors.schedule"
          hide-details="auto"
          persistent-placeholder
        />
      </v-col>

      <v-col cols="12">
        <v-select
          v-model="form.newSiteId"
          :items="siteItems"
          item-title="name"
          item-value="id"
          label="Nueva sucursal (opcional)"
          placeholder="Seleccionar"
          variant="outlined"
          density="comfortable"
          clearable
          :error="hasError('newSiteId') || !!fieldErrors.schedule"
          hide-details="auto"
          persistent-placeholder
        />
        <FieldErrorComponent :message="fieldErrors.schedule" />
      </v-col>
    </template>

    <v-col cols="12">
      <v-textarea
        v-model="form.description"
        v-input-mask="'freeText'"
        data-testid="annex-description"
        label="Descripción"
        placeholder="Describe el motivo del anexo"
        variant="outlined"
        density="comfortable"
        rows="3"
        :error="hasError('description')"
        maxlength="500"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.description" />
    </v-col>
  </v-row>

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-6 mb-4">Documento adjunto</h2>

  <AttachmentField
    v-model="pendingFile"
    label="Documento de respaldo (opcional)"
    :rule="ANNEX_ATTACHMENT_RULE"
    :saved="savedAttachments"
    @remove-saved="removeSavedAttachment"
    @download="downloadAttachmentAction"
  />

  <ErrorComponent :error-fields="backendErrorFields" class="mt-6" />

  <div class="d-flex justify-end ga-2 mt-6">
    <v-btn variant="text" @click="goToAnnexes">Cancelar</v-btn>
    <v-btn
      color="primary"
      variant="flat"
      :prepend-icon="mdiContentSave"
      :loading="saveMutation.isPending.value"
      data-testid="annex-submit"
      @click="submit"
    >
      {{ isEditing ? 'Guardar' : 'Enviar' }}
    </v-btn>
  </div>
</template>
