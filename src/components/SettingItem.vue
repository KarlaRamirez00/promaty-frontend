<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { mdiContentSave } from '@mdi/js'
import { updateSettingAction } from '@/actions'
import { useBackendFieldErrors } from '@/composables/useBackendFieldErrors'
import { useMessage } from '@/composables/useMessage'
import messages from '@/messages'
import { createSettingForm, type Setting, type SettingForm } from '@/models'
import { firstError, settingValueRules } from '@/rules'
import BooleanField from '@/components/common/BooleanField.vue'
import ErrorComponent from '@/components/common/ErrorComponent.vue'
import FieldErrorComponent from '@/components/common/FieldErrorComponent.vue'

const props = defineProps<{
  setting: Setting
  editable: boolean
}>()

const queryClient = useQueryClient()
const { toastUpdated, toastFailed } = useMessage()
const {
  backendErrorFields,
  setFromError,
  clear: clearBackendErrors,
  hasBackendError,
} = useBackendFieldErrors()

const form = ref<SettingForm>(
  createSettingForm({ key: props.setting.key, value: props.setting.value }),
)
const fieldError = ref('')

watch(
  () => props.setting.value,
  (value) => {
    form.value = createSettingForm({ key: props.setting.key, value })
  },
)

const isNumeric = computed(() => props.setting.type !== 'BOOLEAN')
const isDirty = computed(() => form.value.value.trim() !== props.setting.value)
const maskType = computed(() => (props.setting.type === 'DECIMAL' ? 'decimalNumbers' : 'onlyNumbers'))

const booleanValue = computed<boolean>({
  get: () => form.value.value === 'true',
  set: (value) => {
    form.value.value = String(value)
  },
})

const saveMutation = useMutation({
  mutationFn: updateSettingAction,
  onSuccess: (saved) => {
    toastUpdated(messages.setting, `${saved.label}: ${saved.value}`)
    // Los contadores de Contratos dependen de estos valores (días para considerar por vencer).
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ['settings'] }),
      queryClient.invalidateQueries({ queryKey: ['contracts'] }),
    ])
  },
  onError: (error: unknown) => {
    if (!setFromError(error)) toastFailed(messages.setting)
  },
})

function submit() {
  clearBackendErrors()
  fieldError.value = firstError(form.value.value, settingValueRules(props.setting)) ?? ''
  if (fieldError.value) return
  saveMutation.mutate(form.value)
}
</script>

<template>
  <v-card variant="outlined" class="pa-4">
    <div class="text-subtitle-1 font-weight-bold">{{ setting.label }}</div>
    <p class="text-body-2 text-medium-emphasis mt-1 mb-4">
      Actualizado: {{ setting.updatedAt }} · Por {{ setting.updatedBy }}
    </p>

    <div :class="{ 'field-locked': !editable }">
      <v-text-field
        v-if="isNumeric"
        v-model="form.value"
        v-input-mask="maskType"
        label="Valor"
        placeholder="Ingresa el valor"
        variant="outlined"
        density="comfortable"
        :disabled="!editable"
        :error="!!fieldError || hasBackendError('value')"
        maxlength="10"
        hide-details="auto"
        persistent-placeholder
        @keydown.enter="submit"
      />
      <BooleanField v-else v-model="booleanValue" label="Valor" />
    </div>
    <FieldErrorComponent :message="fieldError" />

    <ErrorComponent :error-fields="backendErrorFields" class="mt-4" />

    <div v-if="editable" class="d-flex justify-end mt-4">
      <v-btn
        color="primary"
        variant="flat"
        :prepend-icon="mdiContentSave"
        :disabled="!isDirty"
        :loading="saveMutation.isPending.value"
        @click="submit"
      >
        Guardar
      </v-btn>
    </div>
  </v-card>
</template>
