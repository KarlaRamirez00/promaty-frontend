<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { mdiArrowDownCircleOutline, mdiShapeOutline } from '@mdi/js'
import { createProjectTypeForm, type ProjectTypeForm } from '@/models/projectType/projectType.models'
import { projectTypeNameRules } from '@/rules/projectType.rules'
import { firstError } from '@/rules/validators'
import { useError } from '@/utils/useError'
import projectTypeMessages from '@/messages/projectType.messages'
import type { ApiErrorFields } from '@/types/api'
import ErrorComponent from '@/components/common/ErrorComponent.vue'
import FieldErrorComponent from '@/components/common/FieldErrorComponent.vue'
import AlertComponent from '@/components/common/AlertComponent.vue'

const props = defineProps<{
  projectType: { id: number; name: string } | null
  loading: boolean
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  submit: [form: ProjectTypeForm]
}>()

const { normalizeError } = useError()

const form = ref<ProjectTypeForm>(createProjectTypeForm())
const nameError = ref('')
const backendErrorFields = ref<ApiErrorFields | null>(null)

const hasValidationError = computed(() => !!nameError.value)
const alert = computed(() =>
  hasValidationError.value ? projectTypeMessages.alertError : projectTypeMessages.alertInfo,
)

watch(open, (isOpen) => {
  if (isOpen) {
    form.value = createProjectTypeForm({
      id: props.projectType?.id ?? null,
      name: props.projectType?.name ?? '',
    })
    nameError.value = ''
    backendErrorFields.value = null
  }
})

function submit() {
  const error = firstError(form.value.name, projectTypeNameRules)
  if (error) {
    nameError.value = error
    return
  }
  nameError.value = ''
  emit('submit', form.value)
}

function reportError(error: unknown) {
  const { fieldErrors } = normalizeError(error)
  nameError.value = fieldErrors?.name ?? ''
  backendErrorFields.value = nameError.value ? null : fieldErrors
}

defineExpose({ reportError })
</script>

<template>
  <v-dialog v-model="open" max-width="420">
    <v-card>
      <v-card-title class="d-flex align-center ga-2">
        <v-icon :icon="mdiShapeOutline" color="primary" />
        {{ projectType ? 'Editar tipo de proyecto' : 'Nuevo tipo de proyecto' }}
      </v-card-title>

      <v-card-text>
        <AlertComponent
          :type="hasValidationError ? 'error' : 'info'"
          :message="alert.message"
          :icon="mdiArrowDownCircleOutline"
        />

        <ErrorComponent :error-fields="backendErrorFields" />

        <v-text-field
          v-model="form.name"
          label="Nombre"
          placeholder="Ingresa nombre del tipo de proyecto"
          class="small-placeholder"
          variant="outlined"
          density="comfortable"
          :error="!!nameError"
          hide-details
          persistent-placeholder
          autofocus
          @keyup.enter="submit"
        />
        <FieldErrorComponent :message="nameError" />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="open = false">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" :loading="loading" @click="submit">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.small-placeholder :deep(input::placeholder) {
  font-size: 0.8125rem;
}
</style>
