<script setup lang="ts">
import { computed } from 'vue'
import type { Request } from '@/models'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailFieldList from '@/components/common/DetailFieldList.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'

const props = withDefaults(
  defineProps<{
    request: Request | null
    loading?: boolean
    hasApprovePermission?: boolean
    hasValidatePermission?: boolean
  }>(),
  {
    hasApprovePermission: false,
    hasValidatePermission: false,
  },
)

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  approve: [request: Request]
  validate: [request: Request]
  reject: [request: Request]
}>()

const fields = computed(() => {
  const r = props.request
  if (!r) return []
  return [
    { key: 'typeName', label: 'Tipo de solicitud', value: r.typeName },
    { key: 'costCenterCode', label: 'Centro de costo', value: r.costCenterCode },
    { key: 'projectName', label: 'Proyecto', value: r.projectName },
    { key: 'requesterName', label: 'Solicitante', value: r.requesterName },
    { key: 'createdAt', label: 'Fecha de creación', value: r.createdAt },
    { key: 'updatedAt', label: 'Última actualización', value: r.updatedAt },
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
        :color="request.statusColor"
        class="mt-1"
      >
        {{ request.status.name }}
      </v-chip>
    </template>

    <template v-if="request" #menu>
      <ActionsMenu
        :record="request"
        :show-view="false"
        :has-update-permission="false"
        :has-active-permission="false"
        :has-approve-permission="hasApprovePermission"
        :has-validate-permission="hasValidatePermission"
        @approve="emit('approve', request)"
        @validate="emit('validate', request)"
        @reject="emit('reject', request)"
      />
    </template>

    <div v-if="loading && !request" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <template v-else-if="request">
      <DetailFieldList :items="fields" />

      <h3 class="text-subtitle-2 font-weight-bold mt-6 mb-3">Historial de aprobaciones</h3>

      <p v-if="!request.approvals.length" class="text-body-2 text-medium-emphasis">
        Aún no hay decisiones registradas.
      </p>

      <div v-else class="d-flex flex-column ga-3">
        <v-sheet
          v-for="approval in request.approvals"
          :key="approval.id"
          border
          rounded
          class="px-4 py-3"
        >
          <div class="d-flex align-center justify-space-between ga-2">
            <span class="text-subtitle-2 font-weight-bold">{{ approval.levelLabel }}</span>
            <v-chip size="small" variant="tonal" :color="approval.approved ? 'success' : 'error'">
              {{ approval.approved ? 'Aprobó' : 'Rechazó' }}
            </v-chip>
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            {{ approval.approverName }} · {{ approval.createdAt }}
          </div>
          <div v-if="approval.rejectionReasonName" class="text-body-2 mt-2">
            <span class="font-weight-medium">Motivo:</span> {{ approval.rejectionReasonName }}
          </div>
          <div v-if="approval.comment" class="text-body-2 mt-1">
            <span class="font-weight-medium">Observaciones:</span> {{ approval.comment }}
          </div>
        </v-sheet>
      </div>
    </template>
  </DetailDrawer>
</template>
