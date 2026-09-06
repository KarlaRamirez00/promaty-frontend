<script setup lang="ts">
import { computed, ref } from 'vue'
import { mdiPower } from '@mdi/js'

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
  }>(),
  { entity: 'registro' },
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

const actionLabel = computed(() => (props.record?.active ? 'Desactivar' : 'Activar'))
const actionColor = computed(() => (props.record?.active ? 'primary' : 'success'))
</script>

<template>
  <v-dialog v-model="isOpen" max-width="420">
    <v-card>
      <v-card-title class="d-flex align-center ga-2">
        <v-icon :icon="mdiPower" :color="actionColor" />
        {{ actionLabel }} {{ entity }}
      </v-card-title>

      <v-card-text>
        ¿Seguro que quieres
        <strong>{{ actionLabel.toLowerCase() }}</strong>
        <strong class="text-primary">&nbsp;{{ record?.name }}</strong>?
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="close">Cancelar</v-btn>
        <v-btn :color="actionColor" variant="flat" :loading="loading" @click="emit('confirm')">
          {{ actionLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
