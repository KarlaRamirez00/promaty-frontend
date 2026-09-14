<script setup lang="ts">
import { computed } from 'vue'
import type { Client } from '@/models'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailFieldList from '@/components/common/DetailFieldList.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'

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
    { key: 'createdBy', label: 'Creado por', value: c.createdBy },
    { key: 'updatedAt', label: 'Última actualización', value: c.updatedAt },
    { key: 'updatedBy', label: 'Actualizado por', value: c.updatedBy },
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

    <template v-if="client" #menu>
      <ActionsMenu
        :record="client"
        :has-update-permission="hasUpdatePermission"
        :has-active-permission="hasActivePermission"
        :show-view="false"
        @edit="emit('edit', client)"
        @toggle="emit('toggleActive', client)"
      />
    </template>

    <div v-if="loading && !client" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <DetailFieldList v-else-if="client" :items="fields" />
  </DetailDrawer>
</template>
