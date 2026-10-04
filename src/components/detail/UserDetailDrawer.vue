<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '@/models'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailFieldList from '@/components/common/DetailFieldList.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'

const props = withDefaults(
  defineProps<{
    user: User | null
    costCenters?: string[]
    loading?: boolean
    hasUpdatePermission?: boolean
    hasActivePermission?: boolean
  }>(),
  {
    costCenters: () => [],
    hasUpdatePermission: true,
    hasActivePermission: true,
  },
)

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  edit: [user: User]
  toggleActive: [user: User]
}>()

const fields = computed(() => {
  const u = props.user
  if (!u) return []
  return [
    { key: 'fullName', label: 'Nombre completo', value: u.fullName },
    { key: 'email', label: 'Correo', value: u.email },
    { key: 'phoneNumber', label: 'Teléfono', value: u.phoneNumber },
    { key: 'role', label: 'Rol', value: u.role.name },
    {
      key: 'costCenters',
      label: 'Centros de costo',
      value: u.projectIds.length ? props.costCenters.join(', ') : 'Sin centros de costo asignados',
    },
    { key: 'createdAt', label: 'Fecha de creación', value: u.createdAt },
    { key: 'createdBy', label: 'Creado por', value: u.createdBy },
    { key: 'updatedAt', label: 'Última actualización', value: u.updatedAt },
    { key: 'updatedBy', label: 'Actualizado por', value: u.updatedBy },
  ]
})
</script>

<template>
  <DetailDrawer
    v-model:open="open"
    entity="usuario"
    width="clamp(360px, 40vw, 480px)"
  >
    <template #badge>
      <v-chip v-if="user" size="small" variant="tonal" :color="user.status.color" class="mt-1">
        {{ user.status.label }}
      </v-chip>
    </template>

    <template v-if="user" #menu>
      <ActionsMenu
        :record="user"
        :has-update-permission="hasUpdatePermission"
        :has-active-permission="hasActivePermission"
        :show-view="false"
        @edit="emit('edit', user)"
        @toggle="emit('toggleActive', user)"
      />
    </template>

    <div v-if="loading && !user" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <DetailFieldList v-else-if="user" :items="fields" />
  </DetailDrawer>
</template>
