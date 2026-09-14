<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { mdiArrowDownCircleOutline, mdiContentSave } from '@mdi/js'
import {
  createProjectSpecialtyAction,
  getProjectSpecialtyDetailAction,
  updateProjectSpecialtyAction,
} from '@/actions'
import { useMessage } from '@/composables/useMessage'
import { useError } from '@/utils'
import messages from '@/messages'
import projectSpecialtyMessages from '@/messages/projectSpecialty.messages'
import { ROUTE } from '@/router/route-names'
import {
  createProjectSpecialtyForm,
  type ProjectSpecialtyForm,
} from '@/models'
import { firstError, projectSpecialtyNameRules } from '@/rules'
import type { ApiErrorFields } from '@/types/api'
import ErrorComponent from '@/components/common/ErrorComponent.vue'
import FieldErrorComponent from '@/components/common/FieldErrorComponent.vue'
import AlertComponent from '@/components/common/AlertComponent.vue'

const props = defineProps<{
  id?: string
}>()

const router = useRouter()
const queryClient = useQueryClient()
const { toastSaved, toastFailed } = useMessage()
const { normalizeError } = useError()

const projectSpecialtyId = computed(() => (props.id ? Number(props.id) : null))
const isEditing = computed(() => projectSpecialtyId.value !== null)

const { data: existingProjectSpecialty } = useQuery({
  queryKey: computed(() => ['projectSpecialties', 'detail', projectSpecialtyId.value]),
  queryFn: () => getProjectSpecialtyDetailAction(projectSpecialtyId.value as number),
  enabled: computed(() => projectSpecialtyId.value !== null),
})

const form = ref<ProjectSpecialtyForm>(createProjectSpecialtyForm())
const nameError = ref('')
const backendErrorFields = ref<ApiErrorFields | null>(null)

const hasValidationError = computed(() => !!nameError.value)
const alert = computed(() =>
  hasValidationError.value ? projectSpecialtyMessages.alertError : projectSpecialtyMessages.alertInfo,
)

watch(
  existingProjectSpecialty,
  (projectSpecialty) => {
    if (projectSpecialty) {
      form.value = createProjectSpecialtyForm({ id: projectSpecialty.id, name: projectSpecialty.name })
    }
  },
  { immediate: true },
)

function goToList() {
  router.push({ name: ROUTE.PROJECT_SPECIALTY_LIST })
}

async function saveProjectSpecialty(value: ProjectSpecialtyForm): Promise<void> {
  if (value.id) {
    await updateProjectSpecialtyAction(value)
  } else {
    await createProjectSpecialtyAction(value)
  }
}

const saveMutation = useMutation({
  mutationFn: saveProjectSpecialty,
  onSuccess: (_data, value) => {
    queryClient.invalidateQueries({ queryKey: ['projectSpecialties'] })
    toastSaved(value.id, messages.projectSpecialty)
    goToList()
  },
  onError: (error: unknown) => {
    const { fieldErrors } = normalizeError(error)
    nameError.value = fieldErrors?.name ?? ''
    backendErrorFields.value = nameError.value ? null : fieldErrors
    toastFailed(messages.projectSpecialty)
  },
})

function submit() {
  const error = firstError(form.value.name, projectSpecialtyNameRules)
  if (error) {
    nameError.value = error
    return
  }
  nameError.value = ''
  saveMutation.mutate(form.value)
}
</script>

<template>
  <h1 class="text-h4 font-weight-bold mb-4">
    {{ isEditing ? 'Editar especialidad' : 'Nueva especialidad' }}
  </h1>

  <AlertComponent
    :type="hasValidationError ? 'error' : 'info'"
    :message="alert.message"
    :icon="mdiArrowDownCircleOutline"
  />

  <ErrorComponent :error-fields="backendErrorFields" />

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-2 mb-4">Datos principales</h2>

  <v-text-field
    v-model="form.name"
    label="Nombre"
    placeholder="Ingresa nombre de la especialidad"
    class="small-placeholder"
    variant="outlined"
    density="comfortable"
    :error="!!nameError"
    maxlength="120"
    counter
    hide-details="auto"
    persistent-placeholder
    autofocus
    @keyup.enter="submit"
  />
  <FieldErrorComponent :message="nameError" />

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

<style scoped>
.small-placeholder :deep(input::placeholder) {
  font-size: 0.8125rem;
}
</style>
