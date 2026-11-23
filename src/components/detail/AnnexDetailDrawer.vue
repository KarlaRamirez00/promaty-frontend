<script setup lang="ts">
import { computed } from 'vue'
import { downloadAttachmentAction } from '@/actions'
import { ANNEX_ATTACHMENT_RULE, type Annex, type RequestApproval } from '@/models'
import type { DetailSection } from '@/types/detail'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DetailTabs from '@/components/common/DetailTabs.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'
import ApprovalHistory from '@/components/common/ApprovalHistory.vue'
import AttachmentField from '@/components/common/AttachmentField.vue'
import SyncErrorAlert from '@/components/common/SyncErrorAlert.vue'

const props = withDefaults(
  defineProps<{
    annex: Annex | null
    approvals?: RequestApproval[]
    loading?: boolean
  }>(),
  {
    approvals: () => [],
  },
)

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  edit: [annex: Annex]
  approve: [annex: Annex]
  validate: [annex: Annex]
  reject: [annex: Annex]
  retrySync: [annex: Annex]
}>()

const sections = computed<DetailSection[]>(() => {
  const a = props.annex
  if (!a) return []
  return [
    {
      key: 'annex',
      tab: 'Anexo',
      title: 'Datos del anexo',
      fields: [
        { key: 'fullName', label: 'Colaborador', value: a.fullName },
        { key: 'identificationNumber', label: 'RUT', value: a.identificationNumber },
        ...(a.rexAnnexNumber
          ? [{ key: 'rexAnnexNumber', label: 'N° de anexo Rex+', value: a.rexAnnexNumber }]
          : []),
        { key: 'project', label: 'Centro de costo', value: a.projectName },
        { key: 'annexType', label: 'Tipo de anexo', value: a.annexTypeName },
        { key: 'effectiveDate', label: 'Fecha de vigencia', value: a.effectiveDate },
        { key: 'description', label: 'Descripción', value: a.description },
      ],
    },
    {
      key: 'changes',
      tab: 'Cambio',
      title: 'Cambio al contrato',
      fields: a.changes.map((change) => ({
        key: change.key,
        label: change.label,
        value: `${change.before} → ${change.after}`,
      })),
    },
    {
      key: 'documents',
      tab: 'Documentos',
      title: 'Documento adjunto',
      fields: [],
    },
    {
      key: 'traceability',
      tab: 'Trazabilidad',
      title: 'Trazabilidad',
      fields: [
        { key: 'createdAt', label: 'Fecha de creación', value: a.createdAt },
        { key: 'createdBy', label: 'Creado por', value: a.createdBy },
        { key: 'updatedAt', label: 'Última actualización', value: a.updatedAt },
        { key: 'updatedBy', label: 'Actualizado por', value: a.updatedBy },
      ],
    },
  ]
})
</script>

<template>
  <DetailDrawer v-model:open="open" entity="anexo" width="clamp(400px, 45vw, 520px)">
    <template #badge>
      <v-chip v-if="annex" size="small" variant="tonal" :color="annex.statusColor" class="mt-1">
        {{ annex.status.name }}
      </v-chip>
    </template>

    <template v-if="annex" #menu>
      <ActionsMenu
        :record="annex"
        :show-view="false"
        @edit="emit('edit', annex)"
        @approve="emit('approve', annex)"
        @validate="emit('validate', annex)"
        @reject="emit('reject', annex)"
        @retry-sync="emit('retrySync', annex)"
      />
    </template>

    <SyncErrorAlert v-if="annex" :status-code="annex.status.code" :message="annex.syncErrorMessage" />

    <div v-if="loading && !annex" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <DetailTabs v-else-if="annex" :sections="sections">
      <template #documents>
        <AttachmentField
          :rule="ANNEX_ATTACHMENT_RULE"
          :saved="annex.attachments"
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
