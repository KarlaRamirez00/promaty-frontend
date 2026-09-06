<script setup lang="ts">
import { computed } from 'vue'
import type { Client } from '@/models/client/client.models'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailFieldList from '@/components/common/DetailFieldList.vue'

const props = defineProps<{
  client: Client | null
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  edit: [client: Client]
  toggleActive: [client: Client]
}>()

const fields = computed(() => {
  const c = props.client
  if (!c) return []
  return [
    { key: 'name', label: 'Nombre', value: c.name },
    { key: 'createdAt', label: 'Fecha de creación', value: c.createdAt },
    { key: 'updatedAt', label: 'Última actualización', value: c.updatedAt },
  ]
})
</script>

<template>
  <DetailDrawer v-model:open="open" entity="mandante" width="clamp(360px, 40vw, 480px)">
    <template #badge>
      <v-chip v-if="client" size="small" variant="tonal" :color="client.status.color" class="mt-1">
        {{ client.status.label }}
      </v-chip>
    </template>

    <div v-if="loading && !client" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <DetailFieldList v-else-if="client" :items="fields" />

    <template v-if="client" #actions>
      <v-btn variant="tonal" block @click="emit('edit', client)">Editar</v-btn>
      <v-btn
        variant="text"
        block
        :color="client.active ? 'primary' : 'success'"
        @click="emit('toggleActive', client)"
      >
        {{ client.active ? 'Desactivar' : 'Activar' }}
      </v-btn>
    </template>
  </DetailDrawer>
</template>
