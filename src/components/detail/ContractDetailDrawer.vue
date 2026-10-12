<script setup lang="ts">
import { computed } from 'vue'
import type { Contract, RequestApproval } from '@/models'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailFieldList from '@/components/common/DetailFieldList.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'

const props = withDefaults(
  defineProps<{
    contract: Contract | null
    approvals?: RequestApproval[]
    loading?: boolean
  }>(),
  {
    approvals: () => [],
  },
)

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  approve: [contract: Contract]
  validate: [contract: Contract]
  reject: [contract: Contract]
}>()

const fields = computed(() => {
  const c = props.contract
  if (!c) return []
  return [
    { key: 'fullName', label: 'Colaborador', value: c.fullName },
    { key: 'identificationNumber', label: 'Identificación', value: c.identificationNumber },
    ...(c.rexContractNumber
      ? [{ key: 'rexContractNumber', label: 'N° de contrato Rex+', value: c.rexContractNumber }]
      : []),
    { key: 'costCenterCode', label: 'Centro de costo', value: c.costCenterCode },
    { key: 'companyName', label: 'Empresa', value: c.companyName },
    { key: 'contractTypeName', label: 'Tipo de contrato', value: c.contractTypeName },
    { key: 'jobTitleName', label: 'Cargo', value: c.jobTitleName },
    { key: 'siteName', label: 'Sede', value: c.siteName },
    { key: 'startDate', label: 'Fecha de inicio', value: c.startDate },
    { key: 'endDate', label: 'Fecha de término', value: c.endDate },
    { key: 'baseSalary', label: 'Sueldo base', value: c.baseSalary },
    { key: 'agreedSalary', label: 'Sueldo pactado', value: c.agreedSalary },
    { key: 'weeklyWorkHours', label: 'Horas semanales', value: c.weeklyWorkHours },
    { key: 'workDays', label: 'Días de trabajo', value: c.workDays },
    { key: 'mealTypeName', label: 'Alimentación', value: c.mealTypeName },
    { key: 'transportTypeName', label: 'Transporte', value: c.transportTypeName },
    { key: 'contractDetail', label: 'Detalle', value: c.contractDetail },
    { key: 'createdAt', label: 'Fecha de creación', value: c.createdAt },
    { key: 'updatedAt', label: 'Última actualización', value: c.updatedAt },
  ]
})
</script>

<template>
  <DetailDrawer v-model:open="open" entity="contrato" width="clamp(400px, 45vw, 520px)">
    <template #badge>
      <v-chip v-if="contract" size="small" variant="tonal" :color="contract.statusColor" class="mt-1">
        {{ contract.status.name }}
      </v-chip>
    </template>

    <template v-if="contract" #menu>
      <ActionsMenu
        :record="contract"
        :show-view="false"
        @approve="emit('approve', contract)"
        @validate="emit('validate', contract)"
        @reject="emit('reject', contract)"
      />
    </template>

    <div v-if="loading && !contract" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <template v-else-if="contract">
      <DetailFieldList :items="fields" />

      <h3 class="text-subtitle-2 font-weight-bold mt-6 mb-3">Historial de aprobaciones</h3>

      <p v-if="!approvals.length" class="text-body-2 text-medium-emphasis">
        Aún no hay decisiones registradas.
      </p>

      <div v-else class="d-flex flex-column ga-3">
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
  </DetailDrawer>
</template>
