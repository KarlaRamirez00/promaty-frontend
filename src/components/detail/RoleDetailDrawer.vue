<script setup lang="ts">
import { computed } from 'vue'
import type { Role } from '@/models'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailFieldList from '@/components/common/DetailFieldList.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'

const props = withDefaults(
  defineProps<{
    role: Role | null
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
  edit: [role: Role]
  toggleActive: [role: Role]
}>()

const fields = computed(() => {
  const r = props.role
  if (!r) return []
  return [
    { key: 'name', label: 'Nombre', value: r.name },
    { key: 'description', label: 'Descripción', value: r.description ?? 'Sin descripción' },
    { key: 'totalUsers', label: 'Usuarios asignados', value: String(r.totalUsers) },
    {
      key: 'permissions',
      label: 'Permisos',
      value: r.permissions.length ? r.permissions.map((p) => p.name).join(', ') : 'Sin permisos',
    },
    {
      key: 'subModules',
      label: 'Submódulos',
      value: r.subModules.length
        ? r.subModules.map((s) => s.alias || s.name).join(', ')
        : 'Sin submódulos',
    },
    { key: 'createdAt', label: 'Fecha de creación', value: r.createdAt },
    { key: 'createdBy', label: 'Creado por', value: r.createdBy },
    { key: 'updatedAt', label: 'Última actualización', value: r.updatedAt },
    { key: 'updatedBy', label: 'Actualizado por', value: r.updatedBy },
  ]
})
</script>

<template>
  <DetailDrawer v-model:open="open" entity="rol" width="clamp(360px, 40vw, 480px)">
    <template #badge>
      <v-chip v-if="role" size="small" variant="tonal" :color="role.status.color" class="mt-1">
        {{ role.status.label }}
      </v-chip>
    </template>

    <template v-if="role" #menu>
      <ActionsMenu
        :record="role"
        :has-update-permission="hasUpdatePermission"
        :has-active-permission="hasActivePermission"
        :show-view="false"
        @edit="emit('edit', role)"
        @toggle="emit('toggleActive', role)"
      />
    </template>

    <div v-if="loading && !role" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <DetailFieldList v-else-if="role" :items="fields" />
  </DetailDrawer>
</template>
