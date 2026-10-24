<script setup lang="ts">
import { computed } from 'vue'
import type { NonRehireReason } from '@/models'
import { NO_DATA } from '@/utils'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailFieldList from '@/components/common/DetailFieldList.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'

const props = defineProps<{
  nonRehireReason: NonRehireReason | null
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  edit: [nonRehireReason: NonRehireReason]
  toggleActive: [nonRehireReason: NonRehireReason]
}>()

const fields = computed(() => {
  const r = props.nonRehireReason
  if (!r) return []
  return [
    { key: 'name', label: 'Nombre', value: r.name },
    { key: 'description', label: 'Descripción', value: r.description || NO_DATA },
    { key: 'createdAt', label: 'Fecha de creación', value: r.createdAt },
    { key: 'createdBy', label: 'Creado por', value: r.createdBy },
    { key: 'updatedAt', label: 'Última actualización', value: r.updatedAt },
    { key: 'updatedBy', label: 'Actualizado por', value: r.updatedBy },
  ]
})
</script>

<template>
  <DetailDrawer
    v-model:open="open"
    entity="motivo de no recontratación"
    width="clamp(360px, 40vw, 480px)"
  >
    <template #badge>
      <v-chip
        v-if="nonRehireReason"
        size="small"
        variant="tonal"
        :color="nonRehireReason.status.color"
        class="mt-1"
      >
        {{ nonRehireReason.status.label }}
      </v-chip>
    </template>

    <template v-if="nonRehireReason" #menu>
      <ActionsMenu
        :record="nonRehireReason"
        :show-view="false"
        @edit="emit('edit', nonRehireReason)"
        @toggle="emit('toggleActive', nonRehireReason)"
      />
    </template>

    <div v-if="loading && !nonRehireReason" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <DetailFieldList v-else-if="nonRehireReason" :items="fields" />
  </DetailDrawer>
</template>
