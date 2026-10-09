<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { mdiArrowDownCircleOutline, mdiContentSave } from '@mdi/js'
import {
  createProjectAction,
  getClientOptionsAction,
  getProjectDetailAction,
  getProjectSpecialtyOptionsAction,
  getProjectTypeOptionsAction,
  updateProjectAction,
} from '@/actions'
import { useBackendFieldErrors } from '@/composables/useBackendFieldErrors'
import { useMessage } from '@/composables/useMessage'
import messages from '@/messages'
import projectMessages from '@/messages/project.messages'
import { ROUTE } from '@/router/route-names'
import { createProjectForm, type ProjectForm } from '@/models'
import {
  firstError,
  inputMaskNumbers,
  projectCostCenterCodeRules,
  projectNameRules,
} from '@/rules'
import ErrorComponent from '@/components/common/ErrorComponent.vue'
import FieldErrorComponent from '@/components/common/FieldErrorComponent.vue'
import AlertComponent from '@/components/common/AlertComponent.vue'
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

const projectId = computed(() => (props.id ? Number(props.id) : null))
const isEditing = computed(() => projectId.value !== null)

const { data: existingProject } = useQuery({
  queryKey: computed(() => ['projects', 'detail', projectId.value]),
  queryFn: () => getProjectDetailAction(projectId.value as number),
  enabled: computed(() => projectId.value !== null),
})

const { data: typeOptions } = useQuery({
  queryKey: ['projectTypes', 'options'],
  queryFn: getProjectTypeOptionsAction,
})
const { data: specialtyOptions } = useQuery({
  queryKey: ['projectSpecialties', 'options'],
  queryFn: getProjectSpecialtyOptionsAction,
})
const { data: clientOptions } = useQuery({
  queryKey: ['clients', 'options'],
  queryFn: getClientOptionsAction,
})
const form = ref<ProjectForm>(createProjectForm())

const costCenterCodeModel = computed<string>({
  get: () => form.value.costCenterCode,
  set: (value) => {
    form.value.costCenterCode = inputMaskNumbers(value, 30)
  },
})
const fieldErrors = ref<Record<string, string>>({})

function hasError(field: string): boolean {
  return !!fieldErrors.value[field] || hasBackendError(field)
}

const hasValidationError = computed(() => Object.keys(fieldErrors.value).length > 0)
const alert = computed(() =>
  hasValidationError.value ? projectMessages.alertError : projectMessages.alertInfo,
)

watch(
  existingProject,
  (project) => {
    if (project) {
      form.value = createProjectForm({
        id: project.id,
        name: project.name,
        costCenterCode: project.costCenterCode,
        typeId: project.type.id,
        specialtyId: project.specialty.id,
        clientId: project.client.id,
        startDate: project.startDateRaw,
        endDate: project.endDateRaw,
      })
    }
  },
  { immediate: true },
)

function goToList() {
  router.push({ name: ROUTE.PROJECT_LIST })
}

function validate(): boolean {
  const errors: Record<string, string> = {}

  const nameError = firstError(form.value.name, projectNameRules)
  if (nameError) errors.name = nameError

  const costCenterError = firstError(form.value.costCenterCode, projectCostCenterCodeRules)
  if (costCenterError) errors.costCenterCode = costCenterError

  if (!form.value.typeId) errors.typeId = projectMessages.rules.typeRequired
  if (!form.value.specialtyId) errors.specialtyId = projectMessages.rules.specialtyRequired
  if (!form.value.clientId) errors.clientId = projectMessages.rules.clientRequired
  if (!form.value.startDate) errors.startDate = projectMessages.rules.startDateRequired

  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function saveProject(value: ProjectForm): Promise<void> {
  if (value.id) {
    await updateProjectAction(value)
  } else {
    await createProjectAction(value)
  }
}

const saveMutation = useMutation({
  mutationFn: saveProject,
  onSuccess: (_data, value) => {
    queryClient.invalidateQueries({ queryKey: ['projects'], refetchType: 'none' })
    toastSaved(value.id, messages.project)
    goToList()
  },
  onError: (error: unknown) => {
    if (!setFromError(error)) toastFailed(messages.project)
  },
})

function submit() {
  clearBackendErrors()
  if (!validate()) return
  saveMutation.mutate(form.value)
}
</script>

<template>
  <h1 class="text-h5 font-weight-bold mb-4">
    {{ isEditing ? 'Editar proyecto' : 'Nuevo proyecto' }}
  </h1>

  <AlertComponent
    :type="hasValidationError ? 'error' : 'info'"
    :message="alert.message"
    :icon="mdiArrowDownCircleOutline"
  />

  <h2 class="text-subtitle-1 font-weight-bold text-primary mt-2 mb-4">Datos principales</h2>

  <v-row>
    <v-col cols="12" md="6">
      <v-text-field
        v-model="form.name"
        v-input-mask="'freeText'"
        label="Nombre"
        placeholder="Ingresa nombre del proyecto"
        variant="outlined"
        density="comfortable"
        :error="hasError('name')"
        maxlength="120"
        counter
        hide-details="auto"
        persistent-placeholder
        autofocus
      />
      <FieldErrorComponent :message="fieldErrors.name" />
    </v-col>

    <v-col cols="12" md="6">
      <v-text-field
        v-model="costCenterCodeModel"
        v-input-mask="'lettersAndNumbers'"
        label="Centro de costo"
        placeholder="Ingresa el código de centro de costo"
        variant="outlined"
        density="comfortable"
        :error="hasError('costCenterCode')"
        maxlength="30"
        hide-details="auto"
        persistent-placeholder
      />
      <FieldErrorComponent :message="fieldErrors.costCenterCode" />
    </v-col>

    <v-col cols="12" md="6">
      <DateField
        v-model="form.startDate"
        label="Fecha de inicio"
        :error="hasError('startDate')"
        hide-details
      />
      <FieldErrorComponent :message="fieldErrors.startDate" />
    </v-col>

    <v-col cols="12" md="6">
      <DateField
        v-model="form.endDate"
        label="Fecha de término (opcional)"
        :min-date="form.startDate"
        clearable
        hide-details
      />
    </v-col>

    <v-col cols="12">
      <v-select
        v-model="form.clientId"
        :items="clientOptions ?? []"
        item-title="name"
        item-value="id"
        label="Mandante"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        persistent-placeholder
        :error="hasError('clientId')"
        hide-details
      />
      <FieldErrorComponent :message="fieldErrors.clientId" />
    </v-col>

    <v-col cols="12" class="pb-0">
      <h2 class="text-subtitle-1 font-weight-bold text-primary">Clasificación del proyecto</h2>
    </v-col>

    <v-col cols="12" md="6">
      <v-select
        v-model="form.typeId"
        :items="typeOptions ?? []"
        item-title="name"
        item-value="id"
        label="Tipo de proyecto"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        persistent-placeholder
        :error="hasError('typeId')"
        hide-details
      />
      <FieldErrorComponent :message="fieldErrors.typeId" />
    </v-col>

    <v-col cols="12" md="6">
      <v-select
        v-model="form.specialtyId"
        :items="specialtyOptions ?? []"
        item-title="name"
        item-value="id"
        label="Especialidad"
        placeholder="Seleccionar"
        variant="outlined"
        density="comfortable"
        persistent-placeholder
        :error="hasError('specialtyId')"
        hide-details
      />
      <FieldErrorComponent :message="fieldErrors.specialtyId" />
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
