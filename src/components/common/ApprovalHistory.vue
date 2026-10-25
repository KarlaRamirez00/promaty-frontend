<script setup lang="ts">
import type { RequestApproval } from '@/models'

withDefaults(
  defineProps<{
    approvals?: RequestApproval[]
  }>(),
  {
    approvals: () => [],
  },
)
</script>

<template>
  <template v-if="approvals.length">
    <h3 class="approvals__title">Historial de aprobaciones</h3>

    <div class="d-flex flex-column ga-3">
      <v-sheet v-for="approval in approvals" :key="approval.id" border rounded class="px-4 py-3">
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
</template>

<style scoped>
.approvals__title {
  margin: 24px 0 8px;
  padding: 0 8px;
  font-size: 1rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}
</style>
