<script setup lang="ts">
import { computed } from 'vue'
import type { Contract, RequestApproval } from '@/models'
import type { DetailSection } from '@/types/detail'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailTabs from '@/components/common/DetailTabs.vue'
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

const sections = computed<DetailSection[]>(() => {
  const c = props.contract
  if (!c) return []
  return [
    {
      key: 'contract',
      tab: 'Contrato',
      title: 'Datos del contrato',
      fields: [
        { key: 'fullName', label: 'Colaborador', value: c.fullName },
        { key: 'identificationNumber', label: 'Identificación', value: c.identificationNumber },
        ...(c.rexContractNumber
          ? [{ key: 'rexContractNumber', label: 'N° de contrato Rex+', value: c.rexContractNumber }]
          : []),
        { key: 'costCenterCode', label: 'Centro de costo', value: c.costCenterCode },
        { key: 'companyName', label: 'Empresa', value: c.companyName },
        { key: 'siteName', label: 'Sede', value: c.siteName },
        { key: 'jobTitleName', label: 'Cargo', value: c.jobTitleName },
        { key: 'contractTypeName', label: 'Tipo de contrato', value: c.contractTypeName },
        { key: 'startDate', label: 'Fecha de inicio', value: c.startDate },
        { key: 'endDate', label: 'Fecha de término', value: c.endDate },
        { key: 'contractDetail', label: 'Detalle', value: c.contractDetail },
      ],
    },
    {
      key: 'conditions',
      tab: 'Condiciones',
      title: 'Condiciones laborales',
      fields: [
        { key: 'baseSalary', label: 'Sueldo base', value: c.baseSalary },
        { key: 'agreedSalary', label: 'Sueldo pactado', value: c.agreedSalary },
        { key: 'weeklyWorkHours', label: 'Horas semanales', value: c.weeklyWorkHours },
        { key: 'workDays', label: 'Días de trabajo', value: c.workDays },
        { key: 'mealTypeName', label: 'Alimentación', value: c.mealTypeName },
        { key: 'transportTypeName', label: 'Transporte', value: c.transportTypeName },
      ],
    },
    {
      key: 'traceability',
      tab: 'Trazabilidad',
      title: 'Trazabilidad',
      fields: [
        { key: 'createdAt', label: 'Fecha de creación', value: c.createdAt },
        { key: 'createdBy', label: 'Creado por', value: c.createdBy },
        { key: 'updatedAt', label: 'Última actualización', value: c.updatedAt },
        { key: 'updatedBy', label: 'Actualizado por', value: c.updatedBy },
      ],
    },
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

    <DetailTabs v-else-if="contract" :sections="sections">
      <template #traceability>
        <h3 class="approvals__title">Historial de aprobaciones</h3>

        <p v-if="!approvals.length" class="text-body-2 text-medium-emphasis px-2">
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
    </DetailTabs>
  </DetailDrawer>
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
