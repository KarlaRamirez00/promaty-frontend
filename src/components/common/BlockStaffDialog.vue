<script setup lang="ts">
import { computed, ref } from 'vue'
import { mdiAccountLockOpenOutline, mdiAccountLockOutline, mdiArrowDownCircleOutline } from '@mdi/js'
import messages from '@/messages'
import { createStaffBlockForm, type StaffBlockForm } from '@/models'
import type { ApiErrorFields } from '@/types/api'
import AlertComponent from '@/components/common/AlertComponent.vue'
import ErrorComponent from '@/components/common/ErrorComponent.vue'
import FieldErrorComponent from '@/components/common/FieldErrorComponent.vue'

export type StaffBlockType = 'BLOCK' | 'UNBLOCK'

interface BlockConfig {
  title: string
  verb: string
  label: string
  icon: string
  color: string
}

const CONFIGS: Record<StaffBlockType, BlockConfig> = {
  BLOCK: {
    title: 'Bloquear colaborador',
    verb: 'bloquear',
    label: 'Bloquear',
    icon: mdiAccountLockOutline,
    color: 'error',
  },
  UNBLOCK: {
    title: 'Desbloquear colaborador',
    verb: 'desbloquear',
    label: 'Desbloquear',
    icon: mdiAccountLockOpenOutline,
    color: 'success',
  },
}

const REASON_MAX_LENGTH = 250

const props = withDefaults(
  defineProps<{
    type: StaffBlockType
    loading: boolean
    errorFields?: ApiErrorFields | null
  }>(),
  { errorFields: null },
)

const emit = defineEmits<{
  confirm: [form: StaffBlockForm]
}>()

const isOpen = ref(false)
const form = ref<StaffBlockForm>(createStaffBlockForm())
const reasonError = ref('')

function open() {
  form.value = createStaffBlockForm()
  reasonError.value = ''
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

defineExpose({ open, close })

const config = computed(() => CONFIGS[props.type])
const isBlock = computed(() => props.type === 'BLOCK')
const alertMessage = computed(
  () => `¿Seguro que quieres <strong>${config.value.verb}</strong> a este colaborador?`,
)

function submit() {
  reasonError.value = ''
  if (isBlock.value) {
    const reason = form.value.reason.trim()
    if (!reason) {
      reasonError.value = messages.staff.rules.blockReasonRequired
      return
    }
    if (reason.length > REASON_MAX_LENGTH) {
      reasonError.value = messages.staff.rules.blockReasonMaxLength
      return
    }
  }
  emit('confirm', form.value)
}
</script>

<template>
  <v-dialog v-model="isOpen" max-width="420">
    <v-card>
      <v-card-title class="d-flex align-center ga-2 px-6 pt-6 text-h6">
        <v-icon :icon="config.icon" :color="config.color" size="24" />
        {{ config.title }}
      </v-card-title>

      <v-card-text :class="isBlock ? 'px-6' : 'px-6 pb-3'">
        <AlertComponent
          :type="isBlock ? 'error' : 'success'"
          :message="alertMessage"
          :icon="mdiArrowDownCircleOutline"
        />

        <template v-if="isBlock">
          <v-textarea
            v-model="form.reason"
            v-input-mask="'freeText'"
            label="Motivo del bloqueo"
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
        </template>

        <ErrorComponent :error-fields="errorFields" class="mt-4" />
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="close">Cancelar</v-btn>
        <v-btn :color="config.color" variant="flat" :loading="loading" @click="submit">
          {{ config.label }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
