<script setup lang="ts">
import { computed } from 'vue'
import { downloadAttachmentAction } from '@/actions'
import {
  CONTRACT_ATTACHMENT_RULE,
  type Contract,
  type ContractAttachment,
  type RequestApproval,
} from '@/models'
import type { DetailSection } from '@/types/detail'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailTabs from '@/components/common/DetailTabs.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'
import ApprovalHistory from '@/components/common/ApprovalHistory.vue'
import AttachmentField from '@/components/common/AttachmentField.vue'
import SyncErrorAlert from '@/components/common/SyncErrorAlert.vue'

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
  edit: [contract: Contract]
  approve: [contract: Contract]
  validate: [contract: Contract]
  reject: [contract: Contract]
  annul: [contract: Contract]
  retrySync: [contract: Contract]
}>()

function attachmentsForType(type: string | null): ContractAttachment[] {
  return (props.contract?.attachments ?? []).filter((a) => a.attachmentType === type)
}

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
        { key: 'identificationNumber', label: 'RUT', value: c.identificationNumber },
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
        ...(c.annulmentReason
          ? [{ key: 'annulmentReason', label: 'Motivo de la anulación', value: c.annulmentReason }]
          : []),
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
      key: 'documents',
      tab: 'Documentos',
      title: 'Documentos adjuntos',
      fields: [],
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
        @edit="emit('edit', contract)"
        @approve="emit('approve', contract)"
        @validate="emit('validate', contract)"
        @reject="emit('reject', contract)"
        @annul="emit('annul', contract)"
        @retry-sync="emit('retrySync', contract)"
      />
    </template>

    <SyncErrorAlert v-if="contract" :status-code="contract.status.code" :message="contract.syncErrorMessage" />

    <div v-if="loading && !contract" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <DetailTabs v-else-if="contract" :sections="sections">
      <template #documents>
        <div class="d-flex flex-column ga-6">
          <AttachmentField
            v-for="requirement in contract.attachmentRequirements"
            :key="requirement.type ?? 'generic'"
            :label="requirement.label"
            :rule="CONTRACT_ATTACHMENT_RULE"
            :saved="attachmentsForType(requirement.type)"
            readonly
            @download="downloadAttachmentAction"
          />
        </div>
      </template>

      <template #traceability>
        <ApprovalHistory :approvals="approvals" />
      </template>
    </DetailTabs>
  </DetailDrawer>
</template>
