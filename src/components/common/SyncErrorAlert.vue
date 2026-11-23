<script setup lang="ts">
import { computed } from 'vue'
import { escapeHtml } from '@/utils'
import AlertComponent from '@/components/common/AlertComponent.vue'

const SYNC_ERROR_CODE = 'SYNC_ERROR'

const props = defineProps<{
  statusCode: string
  message: string | null
}>()

// El motivo viene de Rex+: se escapa porque AlertComponent renderiza HTML.
const text = computed(() =>
  props.statusCode === SYNC_ERROR_CODE && props.message
    ? `<strong>Error de sincronización con Rex+:</strong> ${escapeHtml(props.message)}`
    : null,
)
</script>

<template>
  <AlertComponent v-if="text" type="warning" :message="text" data-testid="sync-error-alert" />
</template>
