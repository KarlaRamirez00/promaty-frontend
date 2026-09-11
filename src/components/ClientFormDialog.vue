<script setup lang="ts">
import { ref, watch } from 'vue'
import { mdiDomain } from '@mdi/js'
import { createClientForm, type ClientForm } from '@/models/client/client.models'
import { clientNameRules } from '@/rules/client.rules'
import { firstError } from '@/rules/validators'
import { useError } from '@/utils/useError'
import FormErrorAlert from '@/components/common/FormErrorAlert.vue'

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
const errorMessage = ref('')
const nameErrors = ref<string[]>([])

watch(open, (isOpen) => {
  if (isOpen) {
    form.value = createClientForm({ id: props.client?.id ?? null, name: props.client?.name ?? '' })
    errorMessage.value = ''
    nameErrors.value = []
  }
})

function submit() {
  const error = firstError(form.value.name, clientNameRules)
  if (error) {
    nameErrors.value = [error]
    return
  }
  nameErrors.value = []
  emit('submit', form.value)
}

function reportError(error: unknown) {
  const { message, fieldErrors } = normalizeError(error)
  nameErrors.value = fieldErrors?.name ?? []
  errorMessage.value = nameErrors.value.length ? '' : message
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
        <FormErrorAlert :message="errorMessage" />

        <v-text-field
          v-model="form.name"
          label="Nombre"
          variant="outlined"
          density="comfortable"
          :error-messages="nameErrors"
          autofocus
          @keyup.enter="submit"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="open = false">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" :loading="loading" @click="submit">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
