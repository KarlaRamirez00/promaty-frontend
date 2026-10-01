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
import { useBackendFieldErrors } from '@/composables/useBackendFieldErrors'
import { useMessage } from '@/composables/useMessage'
import messages from '@/messages'
import projectSpecialtyMessages from '@/messages/projectSpecialty.messages'
import { ROUTE } from '@/router/route-names'
import {
  createProjectSpecialtyForm,
  type ProjectSpecialtyForm,
} from '@/models'
import { firstError, projectSpecialtyNameRules } from '@/rules'
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

const projectSpecialtyId = computed(() => (props.id ? Number(props.id) : null))
const isEditing = computed(() => projectSpecialtyId.value !== null)

const { data: existingProjectSpecialty } = useQuery({
  queryKey: computed(() => ['projectSpecialties', 'detail', projectSpecialtyId.value]),
  queryFn: () => getProjectSpecialtyDetailAction(projectSpecialtyId.value as number),
  enabled: computed(() => projectSpecialtyId.value !== null),
})

const form = ref<ProjectSpecialtyForm>(createProjectSpecialtyForm())
const nameError = ref('')

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
    if (!setFromError(error)) toastFailed(messages.projectSpecialty)
  },
})

function submit() {
  clearBackendErrors()
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
  <h1 class="text-h5 font-weight-bold mb-4">
    {{ isEditing ? 'Editar especialidad' : 'Nueva especialidad' }}
  </h1>

  <AlertComponent
    :type="hasValidationError ? 'error' : 'info'"
    :message="alert.message"
    :icon="mdiArrowDownCircleOutline"
  />

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-2 mb-4">Datos principales</h2>

  <v-text-field
    v-model="form.name"
    v-input-mask="'freeText'"
    label="Nombre"
    placeholder="Ingresa nombre de la especialidad"
    variant="outlined"
    density="comfortable"
    :error="!!nameError || hasBackendError('name')"
    maxlength="120"
    counter
    hide-details="auto"
    persistent-placeholder
    autofocus
    @keyup.enter="submit"
  />
  <FieldErrorComponent :message="nameError" />

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
