<script setup lang="ts">
import { computed } from 'vue'
import type { Contract } from '@/models'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailFieldList from '@/components/common/DetailFieldList.vue'

const props = defineProps<{
  contract: Contract | null
  loading?: boolean
}>()

const open = defineModel<boolean>('open', { default: false })

const fields = computed(() => {
  const c = props.contract
  if (!c) return []
  return [
    { key: 'fullName', label: 'Colaborador', value: c.fullName },
    { key: 'identificationNumber', label: 'Identificación', value: c.identificationNumber },
    { key: 'contractNumber', label: 'Número de contrato', value: c.contractNumber },
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

    <div v-if="loading && !contract" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <DetailFieldList v-else-if="contract" :items="fields" />
  </DetailDrawer>
</template>
