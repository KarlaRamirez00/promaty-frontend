<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  deleteContractAttachmentAction,
  downloadAttachmentAction,
  uploadContractAttachmentAction,
} from '@/actions'
import {
  CONTRACT_ATTACHMENT_RULE,
  CONTRACT_ATTACHMENT_TYPE_LABELS,
  CONTRACT_ATTACHMENT_TYPES,
  type Contract,
  type ContractAttachment,
  type ContractAttachmentType,
  type FileAttachment,
  type RequestApproval,
} from '@/models'
import { useMessage } from '@/composables/useMessage'
import messages from '@/messages'
import type { DetailSection } from '@/types/detail'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailTabs from '@/components/common/DetailTabs.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'
import ApprovalHistory from '@/components/common/ApprovalHistory.vue'
import AttachmentField from '@/components/common/AttachmentField.vue'

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

const queryClient = useQueryClient()
const { toastSaved, toastFailed } = useMessage()

const canEditAttachments = computed(
  () => props.contract?.actions.includes('contract.update') ?? false,
)

const pendingByType = ref<Record<ContractAttachmentType, File[]>>(
  Object.fromEntries(CONTRACT_ATTACHMENT_TYPES.map((t) => [t, [] as File[]])) as Record<ContractAttachmentType, File[]>,
)

function attachmentsForType(type: ContractAttachmentType): ContractAttachment[] {
  return (props.contract?.attachments ?? []).filter((a) => a.attachmentType === type)
}

function refreshDetail() {
  if (props.contract) {
    void queryClient.invalidateQueries({ queryKey: ['contracts', 'detail', props.contract.id] })
  }
}

const uploadMutation = useMutation({
  mutationFn: ({ type, file }: { type: ContractAttachmentType; file: File }) =>
    uploadContractAttachmentAction(props.contract!.id, type, file),
  onSuccess: () => {
    toastSaved(null, messages.contract)
    refreshDetail()
  },
  onError: () => toastFailed(messages.contract),
})

const deleteMutation = useMutation({
  mutationFn: (attachmentId: number) =>
    deleteContractAttachmentAction(props.contract!.id, attachmentId),
  onSuccess: refreshDetail,
  onError: () => toastFailed(messages.contract),
})

function onPendingChange(type: ContractAttachmentType, files: File[]) {
  if (files.length === 0) return
  pendingByType.value[type] = []
  uploadMutation.mutate({ type, file: files[0] })
}

function deleteAttachment(attachment: FileAttachment) {
  deleteMutation.mutate(attachment.id)
}

const sections = computed<DetailSection[]>(() => {
  const c = props.contract
  if (!c) return []
  return [
    {
      key: 'documents',
      tab: 'Documentos',
      title: 'Documentos adjuntos',
      fields: [],
    },
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
      <template #documents>
        <div class="d-flex flex-column ga-6">
          <AttachmentField
            v-for="type in CONTRACT_ATTACHMENT_TYPES"
            :key="type"
            :label="CONTRACT_ATTACHMENT_TYPE_LABELS[type]"
            :rule="CONTRACT_ATTACHMENT_RULE"
            :saved="attachmentsForType(type)"
            :model-value="pendingByType[type]"
            :readonly="!canEditAttachments"
            @update:model-value="(files) => onPendingChange(type, files)"
            @remove-saved="deleteAttachment"
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
