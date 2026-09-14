<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectType } from '@/models'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailFieldList from '@/components/common/DetailFieldList.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'

const props = withDefaults(
  defineProps<{
    projectType: ProjectType | null
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
  edit: [projectType: ProjectType]
  toggleActive: [projectType: ProjectType]
}>()

const fields = computed(() => {
  const p = props.projectType
  if (!p) return []
  return [
    { key: 'name', label: 'Nombre', value: p.name },
    { key: 'createdAt', label: 'Fecha de creación', value: p.createdAt },
    { key: 'createdBy', label: 'Creado por', value: p.createdBy },
    { key: 'updatedAt', label: 'Última actualización', value: p.updatedAt },
    { key: 'updatedBy', label: 'Actualizado por', value: p.updatedBy },
  ]
})
</script>

<template>
  <DetailDrawer v-model:open="open" entity="tipo de proyecto" width="clamp(360px, 40vw, 480px)">
    <template #badge>
      <v-chip
        v-if="projectType"
        size="small"
        variant="tonal"
        :color="projectType.status.color"
        class="mt-1"
      >
        {{ projectType.status.label }}
      </v-chip>
    </template>

    <template v-if="projectType" #menu>
      <ActionsMenu
        :record="projectType"
        :has-update-permission="hasUpdatePermission"
        :has-active-permission="hasActivePermission"
        :show-view="false"
        @edit="emit('edit', projectType)"
        @toggle="emit('toggleActive', projectType)"
      />
    </template>

    <div v-if="loading && !projectType" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <DetailFieldList v-else-if="projectType" :items="fields" />
  </DetailDrawer>
</template>
