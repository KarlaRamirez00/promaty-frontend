<script setup lang="ts">
import { computed } from 'vue'
import type { Client } from '@/models/client/client.models'
import { ACTION } from '@/constants/actions.constants'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailFieldList from '@/components/common/DetailFieldList.vue'

const props = withDefaults(
  defineProps<{
    client: Client | null
    loading?: boolean
    hasUpdatePermission?: boolean
    hasActivePermission?: boolean
  }>(),
  {
    hasUpdatePermission: true,
    hasActivePermission: true,
  },
)

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

// Doble gate: el permiso dice quién puede hacerlo; actions[] dice si este registro lo permite ahora.
const showEdit = computed(() => props.hasUpdatePermission && (props.client?.actions.includes(ACTION.UPDATE) ?? false))
const showToggle = computed(
  () => props.hasActivePermission && (props.client?.actions.includes(ACTION.ACTIVE) ?? false),
)
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
      <v-btn v-if="showEdit" variant="tonal" block @click="emit('edit', client)">Editar</v-btn>
      <v-btn
        v-if="showToggle"
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
