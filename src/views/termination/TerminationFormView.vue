<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { mdiArrowDownCircleOutline, mdiContentSave } from '@mdi/js'
import {
  createTerminationRequestAction,
  getLegalTerminationCauseOptionsAction,
  getNonRehireReasonOptionsAction,
  getTerminableStaffOptionsAction,
  getTerminationEditDataAction,
  updateTerminationAction,
  uploadTerminationAttachmentAction,
} from '@/actions'
import { useBackendFieldErrors } from '@/composables/useBackendFieldErrors'
import { useMessage } from '@/composables/useMessage'
import messages from '@/messages'
import terminationMessages from '@/messages/termination.messages'
import { ROUTE } from '@/router/route-names'
import {
  createTerminationForm,
  TERMINATION_ATTACHMENT_RULE,
  WORKFLOW_QUERY_KEYS,
  type TerminationCauseOption,
  type TerminationForm,
  type TerminationOption,
} from '@/models'
import { firstError, terminationNotesRules } from '@/rules'
import ErrorComponent from '@/components/common/ErrorComponent.vue'
import FieldErrorComponent from '@/components/common/FieldErrorComponent.vue'
import AlertComponent from '@/components/common/AlertComponent.vue'
import DateField from '@/components/common/DateField.vue'
import BooleanField from '@/components/common/BooleanField.vue'
import AttachmentField from '@/components/common/AttachmentField.vue'

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

const terminationId = computed(() => (props.id ? Number(props.id) : null))
const isEditing = computed(() => terminationId.value !== null)

const { data: editData } = useQuery({
  queryKey: computed(() => ['terminations', 'editData', terminationId.value]),
  queryFn: () => {
    const id = terminationId.value
    if (id === null) throw new Error('Falta el id para cargar los datos')
    return getTerminationEditDataAction(id)
  },
  enabled: isEditing,
})
const { data: staffOptions } = useQuery({
  queryKey: ['staff', 'terminableOptions'],
  queryFn: getTerminableStaffOptionsAction,
  enabled: computed(() => !isEditing.value),
})
const { data: causeOptions } = useQuery({
  queryKey: ['legalTerminationCauses', 'options'],
  queryFn: getLegalTerminationCauseOptionsAction,
})
const { data: nonRehireReasonOptions } = useQuery({
  queryKey: ['nonRehireReasons', 'options'],
  queryFn: getNonRehireReasonOptionsAction,
})

function withCurrent(options: TerminationOption[] | undefined, current: TerminationOption | null | undefined) {
  const items: (TerminationOption & { props?: { disabled: boolean } })[] = [...(options ?? [])]
  if (current && !items.some((item) => item.id === current.id)) {
    items.push({ ...current, props: { disabled: true } })
  }
  return items
}

function withCurrentCause(
  options: TerminationCauseOption[] | undefined,
  current: TerminationCauseOption | null | undefined,
) {
  const items: (TerminationCauseOption & { props?: { disabled: boolean } })[] = [...(options ?? [])]
  if (current && !items.some((item) => item.id === current.id)) {
    items.push({ ...current, props: { disabled: true } })
  }
  return items
}

const causeItems = computed(() =>
  withCurrentCause(causeOptions.value, editData.value?.currentCause),
)
const nonRehireReasonItems = computed(() =>
  withCurrent(nonRehireReasonOptions.value, editData.value?.currentNonRehireReason),
)

const form = ref<TerminationForm>(createTerminationForm())
const fieldErrors = ref<Record<string, string>>({})
const hasSubmitted = ref(false)
const pendingFile = ref<File[]>([])

watch(
  editData,
  (data) => {
    if (data) form.value = { ...data.form }
  },
  { immediate: true },
)

const selectedStaff = computed(() => staffOptions.value?.find((option) => option.id === form.value.staffId))
const minTerminationDate = computed(() => selectedStaff.value?.minDate ?? null)
const maxTerminationDate = computed(() => selectedStaff.value?.maxDate ?? null)

watch(selectedStaff, (staff) => {
  const date = form.value.terminationDate
  if (!staff || !date) return
  if (date < staff.minDate || (staff.maxDate && date > staff.maxDate)) form.value.terminationDate = null
})

watch(
  () => form.value.definitiveTermination,
  (definitive) => {
    if (!definitive) {
      form.value.nonRehireReasonId = null
      delete fieldErrors.value.nonRehireReasonId
    }
  },
)

const selectedCause = computed<TerminationCauseOption | undefined>(() =>
  causeItems.value.find((c) => c.id === form.value.legalTerminationCauseId),
)

const showAttachment = computed(() => selectedCause.value?.requiresAttachment ?? false)
const attachmentLabel = computed(() => selectedCause.value?.attachmentLabel ?? 'Documento adjunto')

watch(showAttachment, (show) => {
  if (!show) pendingFile.value = []
})

function hasError(field: string): boolean {
  return !!fieldErrors.value[field] || hasBackendError(field)
}

const hasValidationError = computed(() => hasSubmitted.value && Object.keys(fieldErrors.value).length > 0)
const alert = computed(() => {
  if (hasValidationError.value) return terminationMessages.alertError
  return isEditing.value ? terminationMessages.alertEdit : terminationMessages.alertInfo
})

function goToTerminations() {
  void router.push({ name: ROUTE.TERMINATION_LIST })
}

function validate(): boolean {
  const rules = terminationMessages.rules
  const errors: Record<string, string> = {}
  const value = form.value

  if (!isEditing.value && !value.staffId) errors.staffId = rules.staffRequired
  if (!value.terminationDate) errors.terminationDate = rules.terminationDateRequired
  if (!value.legalTerminationCauseId) errors.legalTerminationCauseId = rules.causeRequired
  if (value.definitiveTermination && !value.nonRehireReasonId) {
    errors.nonRehireReasonId = rules.nonRehireReasonRequired
  }
  const notesError = firstError(value.notes, terminationNotesRules)
  if (notesError) errors.notes = notesError

  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function saveTermination(value: TerminationForm): Promise<void> {
  let terminationId: number | undefined
  if (value.id) {
    await updateTerminationAction(value)
    terminationId = value.id
  } else {
    terminationId = await createTerminationRequestAction(value)
  }
  const file = pendingFile.value[0]
  if (file && terminationId) {
    await uploadTerminationAttachmentAction(terminationId, file)
  }
}

const saveMutation = useMutation({
  mutationFn: saveTermination,
  onSuccess: (_data, value) => {
    toastSaved(value.id, messages.termination)
    goToTerminations()
    void queryClient.invalidateQueries({
      predicate: ({ queryKey }) => WORKFLOW_QUERY_KEYS.has(queryKey[0]),
      refetchType: 'none',
    })
  },
  onError: (error: unknown) => {
    if (!setFromError(error)) toastFailed(messages.termination)
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
  <h1 class="text-h5 font-weight-bold mb-4">
    {{ isEditing ? 'Editar finiquito' : 'Nuevo finiquito' }}
  </h1>

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
          disabled
          hide-details
        />
      </div>
      <template v-else>
        <v-autocomplete
          v-model="form.staffId"
          data-testid="termination-staff"
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
  </v-row>

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-6 mb-4">Datos del finiquito</h2>

  <v-row>
    <v-col cols="12" md="6">
      <DateField
        v-model="form.terminationDate"
        data-testid="termination-date"
        label="Fecha de término"
        :min-date="minTerminationDate"
        :max-date="maxTerminationDate"
        :error="hasError('terminationDate')"
        hide-details
      />
      <FieldErrorComponent :message="fieldErrors.terminationDate" />
    </v-col>

    <v-col cols="12" md="6">
      <v-select
        v-model="form.legalTerminationCauseId"
        data-testid="termination-cause"
        :items="causeItems"
        item-title="name"
        item-value="id"
        label="Causal"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('legalTerminationCauseId')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.legalTerminationCauseId" />
    </v-col>

    <v-col cols="12" :md="form.definitiveTermination ? 6 : 12">
      <BooleanField v-model="form.definitiveTermination" label="Finiquito definitivo" />
    </v-col>

    <v-col v-if="form.definitiveTermination" cols="12" md="6">
      <v-select
        v-model="form.nonRehireReasonId"
        data-testid="termination-non-rehire-reason"
        :items="nonRehireReasonItems"
        item-title="name"
        item-value="id"
        label="Motivo de no recontratación"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        :error="hasError('nonRehireReasonId')"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.nonRehireReasonId" />
    </v-col>

    <v-col cols="12">
      <v-textarea
        v-model="form.notes"
        data-testid="termination-notes"
        v-input-mask="'freeText'"
        label="Observaciones (opcional)"
        placeholder="Agrega observaciones del finiquito"
        variant="outlined"
        density="comfortable"
        rows="3"
        :error="hasError('notes')"
        maxlength="500"
        counter
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.notes" />
    </v-col>
  </v-row>

  <v-expansion-panels v-if="showAttachment" :model-value="isEditing ? [] : [0]" class="mt-6">
    <v-expansion-panel>
      <v-expansion-panel-title>
        <span class="text-subtitle-1 font-weight-bold text-primary">Documento adjunto</span>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <div class="pt-2">
          <AttachmentField
            :label="attachmentLabel"
            :rule="TERMINATION_ATTACHMENT_RULE"
            :saved="[]"
            :model-value="pendingFile"
            @update:model-value="(files) => (pendingFile = files)"
            @download="() => {}"
          />
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>

  <ErrorComponent :error-fields="backendErrorFields" class="mt-6" />

  <div class="d-flex justify-end ga-2 mt-6">
    <v-btn variant="text" @click="goToTerminations">Cancelar</v-btn>
    <v-btn
      color="primary"
      variant="flat"
      :prepend-icon="mdiContentSave"
      :loading="saveMutation.isPending.value"
      data-testid="termination-submit"
      @click="submit"
    >
      {{ isEditing ? 'Guardar' : 'Enviar' }}
    </v-btn>
  </div>
</template>
