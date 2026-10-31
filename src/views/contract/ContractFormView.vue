<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { mdiArrowDownCircleOutline, mdiContentSave } from '@mdi/js'
import {
  createContractRequestAction,
  getCompanyOptionsAction,
  getContractProjectOptionsAction,
  getContractStaffOptionsAction,
  getContractTypeOptionsAction,
  getJobTitleOptionsAction,
  getMealTypeOptionsAction,
  getSiteOptionsAction,
  getTransportTypeOptionsAction,
} from '@/actions'
import { useBackendFieldErrors } from '@/composables/useBackendFieldErrors'
import { useMessage } from '@/composables/useMessage'
import { parseCurrency } from '@/utils'
import messages from '@/messages'
import contractMessages from '@/messages/contract.messages'
import { ROUTE } from '@/router/route-names'
import {
  CONTRACT_TYPE_FIXED_TERM_CODE,
  createContractForm,
  WEEKLY_WORK_HOURS_OPTIONS,
  WORK_DAYS_OPTIONS,
  WORKFLOW_QUERY_KEYS,
  type ContractForm,
} from '@/models'
import { contractDetailRules, firstError, isBeforeToday, todayIso } from '@/rules'
import ErrorComponent from '@/components/common/ErrorComponent.vue'
import FieldErrorComponent from '@/components/common/FieldErrorComponent.vue'
import AlertComponent from '@/components/common/AlertComponent.vue'
import DateField from '@/components/common/DateField.vue'

const router = useRouter()
const queryClient = useQueryClient()
const { toastSaved, toastFailed } = useMessage()
const {
  backendErrorFields,
  setFromError,
  clear: clearBackendErrors,
  hasBackendError,
} = useBackendFieldErrors()

const { data: projectOptions } = useQuery({
  queryKey: ['projects', 'contractOptions'],
  queryFn: getContractProjectOptionsAction,
})
const { data: staffOptions } = useQuery({
  queryKey: ['staff', 'contractOptions'],
  queryFn: getContractStaffOptionsAction,
})
const { data: companyOptions } = useQuery({
  queryKey: ['companies', 'options'],
  queryFn: getCompanyOptionsAction,
})
const { data: contractTypeOptions } = useQuery({
  queryKey: ['contractTypes', 'options'],
  queryFn: getContractTypeOptionsAction,
})
const { data: jobTitleOptions } = useQuery({
  queryKey: ['jobTitles', 'options'],
  queryFn: getJobTitleOptionsAction,
})
const { data: siteOptions } = useQuery({
  queryKey: ['sites', 'options'],
  queryFn: getSiteOptionsAction,
})
const { data: mealTypeOptions } = useQuery({
  queryKey: ['mealTypes', 'options'],
  queryFn: getMealTypeOptionsAction,
})
const { data: transportTypeOptions } = useQuery({
  queryKey: ['transportTypes', 'options'],
  queryFn: getTransportTypeOptionsAction,
})

const form = ref<ContractForm>(createContractForm())
const fieldErrors = ref<Record<string, string>>({})
const hasSubmitted = ref(false)

const isFixedTerm = computed(
  () =>
    contractTypeOptions.value?.find((type) => type.id === form.value.contractTypeId)?.code ===
    CONTRACT_TYPE_FIXED_TERM_CODE,
)

watch(isFixedTerm, (fixedTerm) => {
  if (!fixedTerm) {
    form.value.endDate = null
    delete fieldErrors.value.endDate
  }
})

watch(
  () => form.value.startDate,
  (startDate) => {
    const { endDate } = form.value
    if (startDate && endDate && endDate < startDate) form.value.endDate = null
  },
)

function hasError(field: string): boolean {
  return !!fieldErrors.value[field] || hasBackendError(field)
}

const hasValidationError = computed(() => hasSubmitted.value && Object.keys(fieldErrors.value).length > 0)
const alert = computed(() =>
  hasValidationError.value ? contractMessages.alertError : contractMessages.alertInfo,
)

function goToContracts() {
  router.push({ name: ROUTE.CONTRACT_LIST })
}

function validateRequiredSelects(): Record<string, string> {
  const rules = contractMessages.rules
  const required: [keyof ContractForm, string][] = [
    ['projectId', rules.projectRequired],
    ['staffId', rules.staffRequired],
    ['companyId', rules.companyRequired],
    ['contractTypeId', rules.contractTypeRequired],
    ['jobTitleId', rules.jobTitleRequired],
    ['siteId', rules.siteRequired],
    ['workDays', rules.workDaysRequired],
  ]
  return Object.fromEntries(required.filter(([key]) => !form.value[key]).map(([key, message]) => [key, message]))
}

function validateDates(): Record<string, string> {
  const rules = contractMessages.rules
  const errors: Record<string, string> = {}
  const { startDate, endDate } = form.value

  if (!startDate) errors.startDate = rules.startDateRequired
  else if (isBeforeToday(startDate)) errors.startDate = rules.startDatePast

  if (isFixedTerm.value && !endDate) errors.endDate = rules.endDateRequired
  else if (endDate && startDate && endDate < startDate) errors.endDate = rules.endDateBeforeStart

  return errors
}

function validateNumbers(): Record<string, string> {
  const rules = contractMessages.rules
  const errors: Record<string, string> = {}
  const { baseSalary, agreedSalary, weeklyWorkHours } = form.value

  if (!baseSalary) errors.baseSalary = rules.baseSalaryRequired
  else if (parseCurrency(baseSalary) <= 0) errors.baseSalary = rules.salaryPositive

  if (agreedSalary && parseCurrency(agreedSalary) <= 0) errors.agreedSalary = rules.salaryPositive

  if (!weeklyWorkHours) errors.weeklyWorkHours = rules.weeklyWorkHoursRequired

  return errors
}

function validate(): boolean {
  const errors: Record<string, string> = {
    ...validateRequiredSelects(),
    ...validateDates(),
    ...validateNumbers(),
  }

  const detailError = firstError(form.value.contractDetail, contractDetailRules)
  if (detailError) errors.contractDetail = detailError

  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

const saveMutation = useMutation({
  mutationFn: createContractRequestAction,
  onSuccess: () => {
    toastSaved(null, messages.contract)
    goToContracts()
    return queryClient.invalidateQueries({
      predicate: ({ queryKey }) => WORKFLOW_QUERY_KEYS.has(queryKey[0]),
      refetchType: 'none',
    })
  },
  onError: (error: unknown) => {
    if (!setFromError(error)) toastFailed(messages.contract)
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
  <h1 class="text-h5 font-weight-bold mb-4">Nuevo contrato</h1>

  <AlertComponent
    :type="hasValidationError ? 'error' : 'info'"
    :message="alert.message"
    :icon="mdiArrowDownCircleOutline"
  />

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-2 mb-4">Colaborador</h2>

  <v-row>
    <v-col cols="12">
      <v-autocomplete
        v-model="form.staffId"
        data-testid="contract-staff"
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
    </v-col>
  </v-row>

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-6 mb-4">Datos del contrato</h2>

  <v-row>
    <v-col cols="12" :md="isFixedTerm ? 4 : 6">
      <v-select
        v-model="form.contractTypeId"
        data-testid="contract-type"
        :items="contractTypeOptions ?? []"
        item-title="name"
        item-value="id"
        label="Tipo de contrato"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('contractTypeId')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.contractTypeId" />
    </v-col>

    <v-col cols="12" :md="isFixedTerm ? 4 : 6">
      <DateField
        v-model="form.startDate"
        data-testid="contract-start-date"
        label="Fecha de inicio"
        :min-date="todayIso()"
        :error="hasError('startDate')"
        hide-details
      />
      <FieldErrorComponent :message="fieldErrors.startDate" />
    </v-col>

    <v-col v-if="isFixedTerm" cols="12" md="4">
      <DateField
        v-model="form.endDate"
        data-testid="contract-end-date"
        label="Fecha de término"
        :min-date="form.startDate ?? todayIso()"
        :error="hasError('endDate')"
        hide-details
      />
      <FieldErrorComponent :message="fieldErrors.endDate" />
    </v-col>

    <v-col cols="12">
      <v-textarea
        v-model="form.contractDetail"
        v-input-mask="'freeText'"
        label="Detalle del contrato (opcional)"
        placeholder="Agrega observaciones del contrato"
        variant="outlined"
        density="comfortable"
        rows="3"
        :error="hasError('contractDetail')"
        maxlength="500"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.contractDetail" />
    </v-col>
  </v-row>

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-6 mb-4">Datos organizacionales</h2>

  <v-row>
    <v-col cols="12" md="6">
      <v-autocomplete
        v-model="form.projectId"
        data-testid="contract-cost-center"
        :items="projectOptions ?? []"
        item-title="name"
        item-value="id"
        label="Centro de costo"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('projectId')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.projectId" />
    </v-col>

    <v-col cols="12" md="6">
      <v-select
        v-model="form.companyId"
        data-testid="contract-company"
        :items="companyOptions ?? []"
        item-title="name"
        item-value="id"
        label="Empresa"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('companyId')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.companyId" />
    </v-col>

    <v-col cols="12" md="6">
      <v-select
        v-model="form.jobTitleId"
        data-testid="contract-job-title"
        :items="jobTitleOptions ?? []"
        item-title="name"
        item-value="id"
        label="Cargo"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('jobTitleId')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.jobTitleId" />
    </v-col>

    <v-col cols="12" md="6">
      <v-select
        v-model="form.siteId"
        data-testid="contract-site"
        :items="siteOptions ?? []"
        item-title="name"
        item-value="id"
        label="Sede"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('siteId')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.siteId" />
    </v-col>
  </v-row>

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-6 mb-4">Remuneración</h2>

  <v-row>
    <v-col cols="12" md="6">
      <v-text-field
        v-model="form.baseSalary"
        data-testid="contract-base-salary"
        v-input-mask="'currency'"
        label="Sueldo base"
        prefix="$"
        placeholder="Ingresa el sueldo base"
        variant="outlined"
        density="comfortable"
        :error="hasError('baseSalary')"
        inputmode="numeric"
        maxlength="11"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.baseSalary" />
    </v-col>

    <v-col cols="12" md="6">
      <v-text-field
        v-model="form.agreedSalary"
        v-input-mask="'currency'"
        label="Sueldo pactado (opcional)"
        prefix="$"
        placeholder="Ingresa el sueldo pactado"
        variant="outlined"
        density="comfortable"
        :error="hasError('agreedSalary')"
        inputmode="numeric"
        maxlength="11"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.agreedSalary" />
    </v-col>
  </v-row>

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-6 mb-4">Jornada laboral</h2>

  <v-row>
    <v-col cols="12" md="6">
      <v-select
        v-model="form.weeklyWorkHours"
        data-testid="contract-weekly-hours"
        :items="WEEKLY_WORK_HOURS_OPTIONS"
        item-title="title"
        item-value="value"
        label="Horas semanales"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('weeklyWorkHours')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.weeklyWorkHours" />
    </v-col>

    <v-col cols="12" md="6">
      <v-select
        v-model="form.workDays"
        data-testid="contract-work-days"
        :items="WORK_DAYS_OPTIONS"
        item-title="title"
        item-value="value"
        label="Días de trabajo"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('workDays')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.workDays" />
    </v-col>
  </v-row>

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-6 mb-4">Beneficios</h2>

  <v-row>
    <v-col cols="12" md="6">
      <v-select
        v-model="form.mealTypeId"
        :items="mealTypeOptions ?? []"
        item-title="name"
        item-value="id"
        label="Tipo de alimentación (opcional)"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        clearable
        hide-details="auto"
        persistent-placeholder
      />
    </v-col>

    <v-col cols="12" md="6">
      <v-select
        v-model="form.transportTypeId"
        :items="transportTypeOptions ?? []"
        item-title="name"
        item-value="id"
        label="Tipo de transporte (opcional)"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        clearable
        hide-details="auto"
        persistent-placeholder
      />
    </v-col>
  </v-row>

  <ErrorComponent :error-fields="backendErrorFields" class="mt-6" />

  <div class="d-flex justify-end ga-2 mt-6">
    <v-btn variant="text" @click="goToContracts">Cancelar</v-btn>
    <v-btn
      color="primary"
      variant="flat"
      :prepend-icon="mdiContentSave"
      :loading="saveMutation.isPending.value"
      data-testid="contract-submit"
      @click="submit"
    >
      Enviar
    </v-btn>
  </div>
</template>
