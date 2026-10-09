<script setup lang="ts">
import { computed, ref } from 'vue'
import { mdiArrowDownCircleOutline, mdiPower } from '@mdi/js'
import AlertComponent from '@/components/common/AlertComponent.vue'

interface StatusRecord {
  id: number | string
  name: string
  active: boolean
}

const props = withDefaults(
  defineProps<{
    record: StatusRecord | null
    loading: boolean
    entity?: string
    feminine?: boolean
    confirmDisabled?: boolean
  }>(),
  { entity: 'registro', feminine: false, confirmDisabled: false },
)

const emit = defineEmits<{
  confirm: []
}>()

const isOpen = ref(false)

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

defineExpose({ open, close })

const isActive = computed(() => !!props.record?.active)
const actionLabel = computed(() => (isActive.value ? 'Desactivar' : 'Activar'))
const actionColor = computed(() => (isActive.value ? 'primary' : 'success'))
const alertType = computed(() => (isActive.value ? 'error' : 'success'))
const demonstrative = computed(() => (props.feminine ? 'esta' : 'este'))
const alertMessage = computed(
  () =>
    `¿Seguro que quieres <strong>${actionLabel.value.toLowerCase()}</strong> ${demonstrative.value} ${props.entity}?`,
)
</script>

<template>
  <v-dialog v-model="isOpen" max-width="420">
    <v-card>
      <v-card-title class="d-flex align-center ga-2 px-6 pt-6 text-h6">
        <v-icon :icon="mdiPower" :color="actionColor" size="24" />
        {{ actionLabel }} {{ entity }}
      </v-card-title>

      <v-card-text class="px-6">
        <AlertComponent :type="alertType" :message="alertMessage" :icon="mdiArrowDownCircleOutline" />

        <v-sheet border rounded class="px-4 py-3">
          <span class="text-subtitle-1 font-weight-bold">{{ record?.name }}</span>
          <template v-if="$slots.details">
            <v-divider class="my-2" />
            <slot name="details" />
          </template>
        </v-sheet>

        <slot name="extra" />
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="close">Cancelar</v-btn>
        <v-btn
          :color="actionColor"
          variant="flat"
          :loading="loading"
          :disabled="confirmDisabled"
          @click="emit('confirm')"
        >
          {{ actionLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
