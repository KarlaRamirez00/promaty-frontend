<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { mdiArrowDownCircleOutline, mdiContentSave } from '@mdi/js'
import {
  createNonRehireReasonAction,
  getNonRehireReasonDetailAction,
  updateNonRehireReasonAction,
} from '@/actions'
import { useBackendFieldErrors } from '@/composables/useBackendFieldErrors'
import { useMessage } from '@/composables/useMessage'
import messages from '@/messages'
import nonRehireReasonMessages from '@/messages/nonRehireReason.messages'
import { ROUTE } from '@/router/route-names'
import { createNonRehireReasonForm, type NonRehireReasonForm } from '@/models'
import { firstError, nonRehireReasonDescriptionRules, nonRehireReasonNameRules } from '@/rules'
import ErrorComponent from '@/components/common/ErrorComponent.vue'
import FieldErrorComponent from '@/components/common/FieldErrorComponent.vue'
import AlertComponent from '@/components/common/AlertComponent.vue'

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

const reasonId = computed(() => (props.id ? Number(props.id) : null))
const isEditing = computed(() => reasonId.value !== null)

const { data: existingReason } = useQuery({
  queryKey: computed(() => ['nonRehireReasons', 'detail', reasonId.value]),
  queryFn: () => {
    const id = reasonId.value
    if (id === null || id === undefined) throw new Error('Falta el id para cargar los datos')
    return getNonRehireReasonDetailAction(id)
  },
  enabled: computed(() => reasonId.value !== null),
})

const form = ref<NonRehireReasonForm>(createNonRehireReasonForm())
const fieldErrors = ref({ name: '', description: '' })

const hasValidationError = computed(() => Object.values(fieldErrors.value).some(Boolean))
const alert = computed(() =>
  hasValidationError.value ? nonRehireReasonMessages.alertError : nonRehireReasonMessages.alertInfo,
)

watch(
  existingReason,
  (reason) => {
    if (reason) {
      form.value = createNonRehireReasonForm({
        id: reason.id,
        name: reason.name,
        description: reason.description ?? '',
      })
    }
  },
  { immediate: true },
)

function goToList() {
  router.push({ name: ROUTE.NON_REHIRE_REASON_LIST })
}

async function saveReason(value: NonRehireReasonForm): Promise<void> {
  if (value.id) {
    await updateNonRehireReasonAction(value)
  } else {
    await createNonRehireReasonAction(value)
  }
}

const saveMutation = useMutation({
  mutationFn: saveReason,
  onSuccess: (_data, value) => {
    toastSaved(value.id, messages.nonRehireReason)
    goToList()
    return queryClient.invalidateQueries({ queryKey: ['nonRehireReasons'], refetchType: 'none' })
  },
  onError: (error: unknown) => {
    if (!setFromError(error)) toastFailed(messages.nonRehireReason)
  },
})

function submit() {
  clearBackendErrors()
  fieldErrors.value = {
    name: firstError(form.value.name, nonRehireReasonNameRules) ?? '',
    description: firstError(form.value.description, nonRehireReasonDescriptionRules) ?? '',
  }
  if (hasValidationError.value) return
  saveMutation.mutate(form.value)
}
</script>

<template>
  <h1 class="text-h5 font-weight-bold mb-4">
    {{ isEditing ? 'Editar motivo de no recontratación' : 'Nuevo motivo de no recontratación' }}
  </h1>

  <AlertComponent
    :type="hasValidationError ? 'error' : 'info'"
    :message="alert.message"
    :icon="mdiArrowDownCircleOutline"
  />

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-2 mb-4">Datos principales</h2>

  <v-row>
    <v-col cols="12">
      <v-text-field
        v-model="form.name"
        v-input-mask="'freeText'"
        label="Nombre"
        placeholder="Ingresa nombre del motivo"
        variant="outlined"
        density="comfortable"
        :error="!!fieldErrors.name || hasBackendError('name')"
        maxlength="150"
        hide-details="auto"
        persistent-placeholder
        autofocus
      />
      <FieldErrorComponent :message="fieldErrors.name" />
    </v-col>

    <v-col cols="12">
      <v-textarea
        v-model="form.description"
        v-input-mask="'freeText'"
        label="Descripción (opcional)"
        placeholder="Ingresa una descripción"
        variant="outlined"
        density="comfortable"
        rows="3"
        :error="!!fieldErrors.description || hasBackendError('description')"
        maxlength="250"
        counter
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.description" />
    </v-col>
  </v-row>

  <ErrorComponent :error-fields="backendErrorFields" class="mt-6" />

  <div class="d-flex justify-end ga-2 mt-6">
    <v-btn variant="text" @click="goToList">Cancelar</v-btn>
    <v-btn
      color="primary"
      variant="flat"
      :prepend-icon="mdiContentSave"
      :loading="saveMutation.isPending.value"
      @click="submit"
    >
      Guardar
    </v-btn>
  </div>
</template>
