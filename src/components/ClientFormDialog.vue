<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { mdiArrowDownCircleOutline, mdiDomain } from '@mdi/js'
import { createClientForm, type ClientForm } from '@/models/client/client.models'
import { clientNameRules } from '@/rules/client.rules'
import { firstError } from '@/rules/validators'
import { useError } from '@/utils/useError'
import clientMessages from '@/messages/client.messages'
import type { ApiErrorFields } from '@/types/api'
import ErrorComponent from '@/components/common/ErrorComponent.vue'
import FieldErrorComponent from '@/components/common/FieldErrorComponent.vue'
import AlertComponent from '@/components/common/AlertComponent.vue'

const props = defineProps<{
  client: { id: number; name: string } | null
  loading: boolean
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  submit: [form: ClientForm]
}>()

const { normalizeError } = useError()

const form = ref<ClientForm>(createClientForm())
const nameError = ref('')
const backendErrorFields = ref<ApiErrorFields | null>(null)

const hasValidationError = computed(() => !!nameError.value)
const alert = computed(() =>
  hasValidationError.value ? clientMessages.alertError : clientMessages.alertInfo,
)

watch(open, (isOpen) => {
  if (isOpen) {
    form.value = createClientForm({ id: props.client?.id ?? null, name: props.client?.name ?? '' })
    nameError.value = ''
    backendErrorFields.value = null
  }
})

function submit() {
  const error = firstError(form.value.name, clientNameRules)
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
        <v-icon :icon="mdiDomain" color="primary" />
        {{ client ? 'Editar mandante' : 'Nuevo mandante' }}
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
          placeholder="Ingresa nombre del mandante"
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
