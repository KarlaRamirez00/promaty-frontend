<script setup lang="ts">
import { ref, watch } from 'vue'
import { mdiDomain } from '@mdi/js'
import { ApiRequestError } from '@/lib/http'
import { createClientForm, type ClientForm } from '@/models/client/client.models'

const props = defineProps<{
  client: { id: number; name: string } | null
  loading: boolean
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  submit: [form: ClientForm]
}>()

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
  if (!form.value.name.trim()) {
    nameErrors.value = ['El nombre es obligatorio.']
    return
  }
  emit('submit', form.value)
}

function reportError(error: unknown) {
  if (error instanceof ApiRequestError) {
    nameErrors.value = error.errorFields?.name ?? []
    errorMessage.value = nameErrors.value.length ? '' : error.message
  } else {
    errorMessage.value = 'No se pudo guardar el mandante.'
  }
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
        <v-alert v-if="errorMessage" type="error" variant="tonal" density="compact" class="mb-4">
          {{ errorMessage }}
        </v-alert>

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
