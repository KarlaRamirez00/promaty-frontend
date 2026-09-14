<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectSpecialty } from '@/models'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailFieldList from '@/components/common/DetailFieldList.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'

const props = withDefaults(
  defineProps<{
    projectSpecialty: ProjectSpecialty | null
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
  edit: [projectSpecialty: ProjectSpecialty]
  toggleActive: [projectSpecialty: ProjectSpecialty]
}>()

const fields = computed(() => {
  const p = props.projectSpecialty
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
  <DetailDrawer v-model:open="open" entity="especialidad" width="clamp(360px, 40vw, 480px)">
    <template #badge>
      <v-chip
        v-if="projectSpecialty"
        size="small"
        variant="tonal"
        :color="projectSpecialty.status.color"
        class="mt-1"
      >
        {{ projectSpecialty.status.label }}
      </v-chip>
    </template>

    <template v-if="projectSpecialty" #menu>
      <ActionsMenu
        :record="projectSpecialty"
        :has-update-permission="hasUpdatePermission"
        :has-active-permission="hasActivePermission"
        :show-view="false"
        @edit="emit('edit', projectSpecialty)"
        @toggle="emit('toggleActive', projectSpecialty)"
      />
    </template>

    <div v-if="loading && !projectSpecialty" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <DetailFieldList v-else-if="projectSpecialty" :items="fields" />
  </DetailDrawer>
</template>
