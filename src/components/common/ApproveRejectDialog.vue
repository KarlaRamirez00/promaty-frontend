<script setup lang="ts">
import { computed, ref } from 'vue'
import { mdiArrowDownCircleOutline, mdiCheck, mdiClose } from '@mdi/js'
import messages from '@/messages'
import { createRequestDecisionForm, type RequestDecisionForm } from '@/models'
import type { ApiErrorFields } from '@/types/api'
import AlertComponent from '@/components/common/AlertComponent.vue'
import ErrorComponent from '@/components/common/ErrorComponent.vue'
import FieldErrorComponent from '@/components/common/FieldErrorComponent.vue'

export type DecisionType = 'APPROVE' | 'VALIDATE' | 'REJECT'

interface DecisionConfig {
  title: string
  verb: string
  label: string
  icon: string
  color: string
}

const DECISIONS: Record<DecisionType, DecisionConfig> = {
  APPROVE: { title: 'Aprobar solicitud', verb: 'aprobar', label: 'Aprobar', icon: mdiCheck, color: 'success' },
  VALIDATE: { title: 'Validar solicitud', verb: 'validar', label: 'Validar', icon: mdiCheck, color: 'success' },
  REJECT: { title: 'Rechazar solicitud', verb: 'rechazar', label: 'Rechazar', icon: mdiClose, color: 'error' },
}

const props = withDefaults(
  defineProps<{
    type: DecisionType
    record: { title: string; subtitle?: string } | null
    loading: boolean
    reasonOptions?: { id: number; name: string }[]
    errorFields?: ApiErrorFields | null
  }>(),
  { reasonOptions: () => [], errorFields: null },
)

const emit = defineEmits<{
  confirm: [form: RequestDecisionForm]
}>()

const isOpen = ref(false)
const form = ref<RequestDecisionForm>(createRequestDecisionForm())
const reasonError = ref('')

function open() {
  form.value = createRequestDecisionForm()
  reasonError.value = ''
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

defineExpose({ open, close })

const config = computed(() => DECISIONS[props.type])
const isReject = computed(() => props.type === 'REJECT')
const alertMessage = computed(
  () => `¿Seguro que quieres <strong>${config.value.verb}</strong> esta solicitud?`,
)

function submit() {
  reasonError.value = ''
  if (isReject.value && !form.value.rejectionReasonId) {
    reasonError.value = messages.request.rules.rejectionReasonRequired
    return
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

      <v-card-text class="px-6">
        <AlertComponent
          :type="isReject ? 'error' : 'success'"
          :message="alertMessage"
          :icon="mdiArrowDownCircleOutline"
        />

        <v-sheet border rounded class="px-4 py-3">
          <div class="text-subtitle-1 font-weight-bold">{{ record?.title }}</div>
          <div v-if="record?.subtitle" class="text-caption text-medium-emphasis">
            {{ record.subtitle }}
          </div>
        </v-sheet>

        <template v-if="isReject">
          <v-select
            v-model="form.rejectionReasonId"
            :items="reasonOptions"
            item-title="name"
            item-value="id"
            label="Motivo de rechazo"
            placeholder="Seleccionar"
            variant="outlined"
            density="comfortable"
            persistent-placeholder
            :error="!!reasonError"
            hide-details
            class="mt-4"
          />
          <FieldErrorComponent :message="reasonError" />

          <v-textarea
            v-model="form.comment"
            v-input-mask="'freeText'"
            label="Observaciones (opcional)"
            placeholder="Agrega una observación"
            variant="outlined"
            density="comfortable"
            rows="3"
            persistent-placeholder
            hide-details
            class="mt-4"
          />
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
