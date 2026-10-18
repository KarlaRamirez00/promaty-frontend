<script setup lang="ts">
import { computed } from 'vue'
import { useRejectionReasonSubModules } from '@/composables/useRejectionReasonSubModules'
import type { RequestRejectionReason } from '@/models'
import { NO_DATA } from '@/utils'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailFieldList from '@/components/common/DetailFieldList.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'

const props = defineProps<{
  requestRejectionReason: RequestRejectionReason | null
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { default: false })

const { nameOf } = useRejectionReasonSubModules()

const emit = defineEmits<{
  edit: [requestRejectionReason: RequestRejectionReason]
  toggleActive: [requestRejectionReason: RequestRejectionReason]
}>()

const fields = computed(() => {
  const r = props.requestRejectionReason
  if (!r) return []
  return [
    { key: 'name', label: 'Nombre', value: r.name },
    { key: 'subModule', label: 'Submódulo', value: nameOf(r.subModule) },
    { key: 'description', label: 'Descripción', value: r.description || NO_DATA },
    { key: 'createdAt', label: 'Fecha de creación', value: r.createdAt },
    { key: 'createdBy', label: 'Creado por', value: r.createdBy },
    { key: 'updatedAt', label: 'Última actualización', value: r.updatedAt },
    { key: 'updatedBy', label: 'Actualizado por', value: r.updatedBy },
  ]
})
</script>

<template>
  <DetailDrawer v-model:open="open" entity="motivo de rechazo" width="clamp(360px, 40vw, 480px)">
    <template #badge>
      <v-chip
        v-if="requestRejectionReason"
        size="small"
        variant="tonal"
        :color="requestRejectionReason.status.color"
        class="mt-1"
      >
        {{ requestRejectionReason.status.label }}
      </v-chip>
    </template>

    <template v-if="requestRejectionReason" #menu>
      <ActionsMenu
        :record="requestRejectionReason"
        :show-view="false"
        @edit="emit('edit', requestRejectionReason)"
        @toggle="emit('toggleActive', requestRejectionReason)"
      />
    </template>

    <div v-if="loading && !requestRejectionReason" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <DetailFieldList v-else-if="requestRejectionReason" :items="fields" />
  </DetailDrawer>
</template>
