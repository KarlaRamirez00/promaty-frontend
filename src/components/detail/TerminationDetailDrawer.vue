<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  deleteTerminationAttachmentAction,
  downloadAttachmentAction,
  uploadTerminationAttachmentAction,
} from '@/actions'
import {
  TERMINATION_ATTACHMENT_RULE,
  type FileAttachment,
  type RequestApproval,
  type Termination,
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
}>()

const queryClient = useQueryClient()
const { toastSaved, toastFailed } = useMessage()

const canEditAttachments = computed(
  () => props.termination?.actions.includes('termination.update') ?? false,
)

const showAttachmentSlot = computed(
  () => props.termination?.requiredAttachmentLabel !== null && props.termination !== null,
)

const pendingFile = ref<File[]>([])

function refreshDetail() {
  if (props.termination) {
    void queryClient.invalidateQueries({ queryKey: ['terminations', 'detail', props.termination.id] })
  }
}

const uploadMutation = useMutation({
  mutationFn: (file: File) => uploadTerminationAttachmentAction(props.termination!.id, file),
  onSuccess: () => {
    toastSaved(null, messages.termination)
    refreshDetail()
  },
  onError: () => toastFailed(messages.termination),
})

const deleteMutation = useMutation({
  mutationFn: (attachmentId: number) =>
    deleteTerminationAttachmentAction(props.termination!.id, attachmentId),
  onSuccess: refreshDetail,
  onError: () => toastFailed(messages.termination),
})

function onPendingChange(files: File[]) {
  if (files.length === 0) return
  pendingFile.value = []
  uploadMutation.mutate(files[0])
}

function deleteAttachment(attachment: FileAttachment) {
  deleteMutation.mutate(attachment.id)
}

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
    baseSections.unshift({
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
        :disable-approve="termination.missingRequiredAttachment"
        @edit="emit('edit', termination)"
        @approve="emit('approve', termination)"
        @validate="emit('validate', termination)"
        @reject="emit('reject', termination)"
        @annul="emit('annul', termination)"
      />
    </template>

    <div v-if="loading && !termination" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <DetailTabs v-else-if="termination" :sections="sections">
      <template v-if="showAttachmentSlot" #documents>
        <v-alert
          v-if="termination.missingRequiredAttachment"
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          Falta adjuntar el documento requerido para aprobar este finiquito.
        </v-alert>
        <AttachmentField
          :label="termination.requiredAttachmentLabel ?? undefined"
          :rule="TERMINATION_ATTACHMENT_RULE"
          :saved="termination.attachments"
          :model-value="pendingFile"
          :readonly="!canEditAttachments"
          @update:model-value="onPendingChange"
          @remove-saved="deleteAttachment"
          @download="downloadAttachmentAction"
        />
      </template>

      <template #traceability>
        <ApprovalHistory :approvals="approvals" />
      </template>
    </DetailTabs>
  </DetailDrawer>
</template>
