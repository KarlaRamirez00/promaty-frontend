<script setup lang="ts">
import { computed } from 'vue'
import { downloadAttachmentAction } from '@/actions'
import { TERMINATION_ATTACHMENT_RULE, type RequestApproval, type Termination } from '@/models'
import type { DetailSection } from '@/types/detail'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailTabs from '@/components/common/DetailTabs.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'
import ApprovalHistory from '@/components/common/ApprovalHistory.vue'
import AttachmentField from '@/components/common/AttachmentField.vue'
import SyncErrorAlert from '@/components/common/SyncErrorAlert.vue'

const props = withDefaults(
  defineProps<{
    termination: Termination | null
    approvals?: RequestApproval[]
    loading?: boolean
  }>(),
  {
    approvals: () => [],
  },
)

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  edit: [termination: Termination]
  approve: [termination: Termination]
  validate: [termination: Termination]
  reject: [termination: Termination]
  annul: [termination: Termination]
  retrySync: [termination: Termination]
}>()

// Los adjuntos del finiquito se editan desde su formulario; el detalle solo los muestra y descarga.
const attachmentRequirement = computed(() => props.termination?.attachmentRequirements[0] ?? null)

const missingRequiredAttachment = computed(
  () => props.termination?.attachmentRequirements.some((item) => item.required && !item.fulfilled) ?? false,
)

const showAttachmentSlot = computed(
  () => attachmentRequirement.value !== null || (props.termination?.attachments.length ?? 0) > 0,
)

const sections = computed<DetailSection[]>(() => {
  const t = props.termination
  if (!t) return []

  const baseSections: DetailSection[] = [
    {
      key: 'termination',
      tab: 'Finiquito',
      title: 'Datos del finiquito',
      fields: [
        { key: 'fullName', label: 'Colaborador', value: t.fullName },
        { key: 'identificationNumber', label: 'RUT', value: t.identificationNumber },
        ...(t.rexTerminationNumber
          ? [{ key: 'rexTerminationNumber', label: 'N° de finiquito Rex+', value: t.rexTerminationNumber }]
          : []),
        { key: 'costCenterCode', label: 'Centro de costo', value: t.costCenterCode },
        { key: 'jobTitleName', label: 'Cargo', value: t.jobTitleName },
        { key: 'contractStartDate', label: 'Inicio del contrato', value: t.contractStartDate },
        { key: 'terminationDate', label: 'Fecha de término', value: t.terminationDate },
        { key: 'cause', label: 'Causal', value: t.legalTerminationCauseName },
        { key: 'definitive', label: 'Finiquito definitivo', value: t.definitive },
        ...(t.isDefinitive
          ? [{ key: 'nonRehireReason', label: 'Motivo de no recontratación', value: t.nonRehireReasonName }]
          : []),
        { key: 'notes', label: 'Observaciones', value: t.notes },
        ...(t.annulmentReason
          ? [{ key: 'annulmentReason', label: 'Motivo de la anulación', value: t.annulmentReason }]
          : []),
      ],
    },
    {
      key: 'traceability',
      tab: 'Trazabilidad',
      title: 'Trazabilidad',
      fields: [
        { key: 'createdAt', label: 'Fecha de creación', value: t.createdAt },
        { key: 'createdBy', label: 'Creado por', value: t.createdBy },
        { key: 'updatedAt', label: 'Última actualización', value: t.updatedAt },
        { key: 'updatedBy', label: 'Actualizado por', value: t.updatedBy },
      ],
    },
  ]

  if (showAttachmentSlot.value) {
    baseSections.splice(1, 0, {
      key: 'documents',
      tab: 'Documentos',
      title: 'Documento adjunto',
      fields: [],
    })
  }

  return baseSections
})
</script>

<template>
  <DetailDrawer v-model:open="open" entity="finiquito" width="clamp(400px, 45vw, 520px)">
    <template #badge>
      <v-chip v-if="termination" size="small" variant="tonal" :color="termination.statusColor" class="mt-1">
        {{ termination.status.name }}
      </v-chip>
    </template>

    <template v-if="termination" #menu>
      <ActionsMenu
        :record="termination"
        :show-view="false"
        :disable-approve="missingRequiredAttachment"
        @edit="emit('edit', termination)"
        @approve="emit('approve', termination)"
        @validate="emit('validate', termination)"
        @reject="emit('reject', termination)"
        @annul="emit('annul', termination)"
        @retry-sync="emit('retrySync', termination)"
      />
    </template>

    <SyncErrorAlert
      v-if="termination"
      :status-code="termination.status.code"
      :message="termination.syncErrorMessage"
    />

    <div v-if="loading && !termination" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <DetailTabs v-else-if="termination" :sections="sections">
      <template v-if="showAttachmentSlot" #documents>
        <v-alert
          v-if="missingRequiredAttachment"
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          Falta adjuntar el documento requerido para aprobar este finiquito. Edítalo para agregarlo.
        </v-alert>
        <AttachmentField
          :label="attachmentRequirement?.label"
          :rule="TERMINATION_ATTACHMENT_RULE"
          :saved="termination.attachments"
          readonly
          @download="downloadAttachmentAction"
        />
      </template>

      <template #traceability>
        <ApprovalHistory :approvals="approvals" />
      </template>
    </DetailTabs>
  </DetailDrawer>
</template>
