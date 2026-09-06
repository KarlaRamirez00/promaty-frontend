<script setup lang="ts">
import { computed } from 'vue'
import type { Request, RequestStatus } from '@/types/request'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailFieldList from '@/components/common/DetailFieldList.vue'

const props = defineProps<{
  request: Request | null
}>()

const open = defineModel<boolean>('open', { default: false })

const statusColor: Record<RequestStatus, string> = {
  'Pendiente aprobación': 'warning',
  'Pendiente validación': 'info',
  Aprobado: 'success',
  Rechazado: 'error',
}

const fields = computed(() => {
  const r = props.request
  if (!r) return []
  return [
    { key: 'type', label: 'Tipo de solicitud', value: r.type },
    { key: 'cc', label: 'Centro de costo', value: r.cc },
    { key: 'project', label: 'Proyecto', value: r.project },
    { key: 'requester', label: 'Solicitante', value: r.requester },
    { key: 'createdAt', label: 'Fecha de creación', value: r.createdAt },
  ]
})
</script>

<template>
  <DetailDrawer v-model:open="open" entity="solicitud" width="clamp(400px, 45vw, 520px)">
    <template #badge>
      <v-chip
        v-if="request"
        size="small"
        variant="tonal"
        :color="statusColor[request.status]"
        class="mt-1"
      >
        {{ request.status }}
      </v-chip>
    </template>

    <DetailFieldList v-if="request" :items="fields" />
  </DetailDrawer>
</template>
