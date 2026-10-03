<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { mdiArrowDownCircleOutline, mdiContentSave } from '@mdi/js'
import {
  createProjectTypeAction,
  getProjectTypeDetailAction,
  updateProjectTypeAction,
} from '@/actions'
import { useBackendFieldErrors } from '@/composables/useBackendFieldErrors'
import { useMessage } from '@/composables/useMessage'
import messages from '@/messages'
import projectTypeMessages from '@/messages/projectType.messages'
import { ROUTE } from '@/router/route-names'
import { createProjectTypeForm, type ProjectTypeForm } from '@/models'
import { firstError, projectTypeNameRules } from '@/rules'
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

const projectTypeId = computed(() => (props.id ? Number(props.id) : null))
const isEditing = computed(() => projectTypeId.value !== null)

const { data: existingProjectType } = useQuery({
  queryKey: computed(() => ['projectTypes', 'detail', projectTypeId.value]),
  queryFn: () => getProjectTypeDetailAction(projectTypeId.value as number),
  enabled: computed(() => projectTypeId.value !== null),
})

const form = ref<ProjectTypeForm>(createProjectTypeForm())
const nameError = ref('')

const hasValidationError = computed(() => !!nameError.value)
const alert = computed(() =>
  hasValidationError.value ? projectTypeMessages.alertError : projectTypeMessages.alertInfo,
)

watch(
  existingProjectType,
  (projectType) => {
    if (projectType) form.value = createProjectTypeForm({ id: projectType.id, name: projectType.name })
  },
  { immediate: true },
)

function goToList() {
  router.push({ name: ROUTE.PROJECT_TYPE_LIST })
}

async function saveProjectType(value: ProjectTypeForm): Promise<void> {
  if (value.id) {
    await updateProjectTypeAction(value)
  } else {
    await createProjectTypeAction(value)
  }
}

const saveMutation = useMutation({
  mutationFn: saveProjectType,
  onSuccess: (_data, value) => {
    queryClient.invalidateQueries({ queryKey: ['projectTypes'], refetchType: 'none' })
    toastSaved(value.id, messages.projectType)
    goToList()
  },
  onError: (error: unknown) => {
    if (!setFromError(error)) toastFailed(messages.projectType)
  },
})

function submit() {
  clearBackendErrors()
  const error = firstError(form.value.name, projectTypeNameRules)
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
    {{ isEditing ? 'Editar tipo de proyecto' : 'Nuevo tipo de proyecto' }}
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
    placeholder="Ingresa nombre del tipo de proyecto"
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
