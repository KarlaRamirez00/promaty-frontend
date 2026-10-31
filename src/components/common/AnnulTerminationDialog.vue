<script setup lang="ts">
import { ref } from 'vue'
import { mdiArrowDownCircleOutline, mdiCancel } from '@mdi/js'
import messages from '@/messages'
import { createTerminationAnnulForm, type TerminationAnnulForm } from '@/models'
import type { ApiErrorFields } from '@/types/api'
import AlertComponent from '@/components/common/AlertComponent.vue'
import ErrorComponent from '@/components/common/ErrorComponent.vue'
import FieldErrorComponent from '@/components/common/FieldErrorComponent.vue'

const REASON_MAX_LENGTH = 250

withDefaults(
  defineProps<{
    loading: boolean
    errorFields?: ApiErrorFields | null
  }>(),
  { errorFields: null },
)

const emit = defineEmits<{
  confirm: [form: TerminationAnnulForm]
}>()

const isOpen = ref(false)
const form = ref<TerminationAnnulForm>(createTerminationAnnulForm())
const reasonError = ref('')

function open() {
  form.value = createTerminationAnnulForm()
  reasonError.value = ''
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

defineExpose({ open, close })

function submit() {
  reasonError.value = ''
  const reason = form.value.reason.trim()
  if (!reason) {
    reasonError.value = messages.termination.rules.annulReasonRequired
    return
  }
  if (reason.length > REASON_MAX_LENGTH) {
    reasonError.value = messages.termination.rules.annulReasonMaxLength
    return
  }
  emit('confirm', form.value)
}
</script>

<template>
  <v-dialog v-model="isOpen" max-width="420">
    <v-card>
      <v-card-title class="d-flex align-center ga-2 px-6 pt-6 text-h6">
        <v-icon :icon="mdiCancel" color="error" size="24" />
        Anular finiquito
      </v-card-title>

      <v-card-text class="px-6">
        <AlertComponent
          type="error"
          message="¿Seguro que quieres <strong>anular</strong> este finiquito?"
          :icon="mdiArrowDownCircleOutline"
        />

        <v-textarea
          v-model="form.reason"
          data-testid="annul-reason"
          v-input-mask="'freeText'"
          label="Motivo de la anulación"
          placeholder="Indica el motivo"
          variant="outlined"
          density="comfortable"
          rows="3"
          persistent-placeholder
          :error="!!reasonError"
          hide-details
          class="mt-4"
        />
        <FieldErrorComponent :message="reasonError" />

        <ErrorComponent :error-fields="errorFields" class="mt-4" />
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="close">Cancelar</v-btn>
        <v-btn
          color="error"
          variant="flat"
          :loading="loading"
          data-testid="annul-confirm"
          @click="submit"
        >
          Anular
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
