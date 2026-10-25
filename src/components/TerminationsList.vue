<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import {
  getCostCenterOptionsAction,
  getRequestDetailAction,
  getTerminationDetailAction,
  getTerminationListAction,
  getTerminationStatusOptionsAction,
  TERMINATION_REJECTION_SUBMODULE,
} from '@/actions'
import { useActiveFilters } from '@/composables/useActiveFilters'
import { useDetailSlide } from '@/composables/useDetailSlide'
import { useListQuery } from '@/composables/useListQuery'
import { useRequestDecision } from '@/composables/useRequestDecision'
import { useTerminationAnnul } from '@/composables/useTerminationAnnul'
import {
  parseTerminationQuery,
  terminationQueryToRoute,
  type TerminationListItem,
  type TerminationQueryParams,
} from '@/models'
import { formatDate } from '@/utils'
import ListControls from '@/components/common/ListControls.vue'
import ActiveFilters from '@/components/common/ActiveFilters.vue'
import FiltersDrawer, { type FilterField } from '@/components/common/FiltersDrawer.vue'
import TerminationDetailDrawer from '@/components/detail/TerminationDetailDrawer.vue'
import ListFooter from '@/components/common/ListFooter.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'
import ApproveRejectDialog from '@/components/common/ApproveRejectDialog.vue'
import AnnulTerminationDialog from '@/components/common/AnnulTerminationDialog.vue'

const {
  detailQueryParam,
  isOpen: detailDrawerOpen,
  open: openDetail,
  record: selectedTermination,
  isLoading: detailLoading,
} = useDetailSlide('terminations', getTerminationDetailAction)

const {
  query,
  patchQuery,
  searchInput,
  pageModel,
  sizeModel,
  items,
  totalItems,
  pageCount,
  isPending,
  isError,
} = useListQuery<TerminationQueryParams, TerminationListItem>({
  resource: 'terminations',
  parse: parseTerminationQuery,
  toRoute: terminationQueryToRoute,
  fetch: getTerminationListAction,
  extraRouteQuery: () => detailQueryParam.value,
})

const {
  setDialogRef: setDecisionDialogRef,
  type: decisionType,
  rejectionReasons,
  backendErrorFields: decisionErrorFields,
  isPending: decisionPending,
  askDecision,
  confirmDecision,
} = useRequestDecision(TERMINATION_REJECTION_SUBMODULE)

const {
  setDialogRef: setAnnulDialogRef,
  backendErrorFields: annulErrorFields,
  isPending: isAnnulling,
  askAnnul,
  confirmAnnul,
} = useTerminationAnnul()

const filtersOpen = ref(false)

const { data: statusOptions } = useQuery({
  queryKey: ['terminations', 'options', 'statuses'],
  queryFn: getTerminationStatusOptionsAction,
})
const { data: costCenterOptions } = useQuery({
  queryKey: ['projects', 'options', 'costCenters'],
  queryFn: getCostCenterOptionsAction,
})

const filterFields = computed<FilterField[]>(() => [
  {
    key: 'statusId',
    type: 'select',
    label: 'Estado',
    options: (statusOptions.value ?? []).map((o) => ({ title: o.name, value: o.id })),
  },
  {
    key: 'projectId',
    type: 'autocomplete',
    label: 'Centro de costo',
    options: (costCenterOptions.value ?? []).map((o) => ({ title: o.title, value: o.id })),
  },
  { key: 'dateRange', type: 'date', label: 'Fecha de término', range: true },
])

const filterValues = computed<Record<string, unknown>>({
  get: () => ({
    statusId: query.value.statusId,
    projectId: query.value.projectId,
    dateRange:
      query.value.terminationDateFrom && query.value.terminationDateTo
        ? [query.value.terminationDateFrom, query.value.terminationDateTo]
        : null,
  }),
  set: (value) => {
    const range = value.dateRange as [string, string] | null | undefined
    patchQuery({
      statusId: (value.statusId as number | null) ?? null,
      projectId: (value.projectId as number | null) ?? null,
      terminationDateFrom: range?.[0] ?? null,
      terminationDateTo: range?.[1] ?? null,
    })
  },
})

const { activeFilters, clearFilter, clearAllFilters } = useActiveFilters<TerminationQueryParams>({
  patchQuery,
  resetAll: { statusId: null, projectId: null, terminationDateFrom: null, terminationDateTo: null },
  chips: () => {
    const chips = []
    const statusName = statusOptions.value?.find((o) => o.id === query.value.statusId)?.name
    if (statusName) chips.push({ key: 'statusId', label: `Estado: ${statusName}` })
    const costCenter = costCenterOptions.value?.find((o) => o.id === query.value.projectId)?.title
    if (costCenter) chips.push({ key: 'projectId', label: `Centro de costo: ${costCenter}` })
    if (query.value.terminationDateFrom && query.value.terminationDateTo) {
      chips.push({
        key: 'dateRange',
        label: `Término: ${formatDate(query.value.terminationDateFrom)} a ${formatDate(query.value.terminationDateTo)}`,
        reset: { terminationDateFrom: null, terminationDateTo: null },
      })
    }
    return chips
  },
})

const headers = [
  { title: 'CC', key: 'costCenterCode', sortable: false },
  { title: 'Colaborador', key: 'fullName', sortable: false },
  { title: 'RUT', key: 'identificationNumber', sortable: false },
  { title: 'Causal', key: 'legalTerminationCauseName', sortable: false },
  { title: 'Fecha de término', key: 'terminationDate', sortable: false },
  { title: 'Definitivo', key: 'definitive', sortable: false, align: 'center' as const },
  { title: 'Estado', key: 'statusName', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]

// El historial de aprobaciones vive en la solicitud asociada al finiquito.
const { data: selectedRequest } = useQuery({
  queryKey: computed(() => ['requests', 'detail', selectedTermination.value?.requestId]),
  queryFn: () => {
    const id = selectedTermination.value?.requestId
    if (id === undefined) throw new Error('No hay solicitud asociada al finiquito')
    return getRequestDetailAction(id)
  },
  enabled: computed(() => selectedTermination.value !== undefined),
})

function viewDetail(item: { id: number }) {
  openDetail(item.id)
}
</script>

<template>
  <div class="mb-6">
    <h1 class="text-h5 font-weight-bold">Lista de finiquitos</h1>
    <p class="text-body-2 text-medium-emphasis mt-1">Finiquitos de los colaboradores registrados en el sistema.</p>
  </div>

  <ListControls
    v-model:search="searchInput"
    search-placeholder="Buscar por RUT o nombre"
    :show-export="false"
    :show-new="false"
    @filter="filtersOpen = true"
  />

  <ActiveFilters
    :filters="activeFilters"
    @remove-filter="clearFilter"
    @clear-all="clearAllFilters"
  />

  <v-alert v-if="isError" type="error" variant="tonal" density="compact" class="mb-4 text-caption">
    No se pudo cargar la lista de finiquitos.
  </v-alert>

  <v-data-table-server
    mobile-breakpoint="md"
    :page="query.page"
    :items-per-page="query.size"
    :headers="headers"
    :items="items"
    :items-length="totalItems"
    :loading="isPending"
  >
    <template #item.fullName="{ item }">
      <span class="link-cell" @click="viewDetail(item)">{{ item.fullName }}</span>
    </template>

    <template #item.definitive="{ item }">
      <v-tooltip :text="item.definitive ? 'Definitivo' : 'No definitivo'" location="top">
        <template #activator="{ props: tooltipProps }">
          <span
            v-bind="tooltipProps"
            role="img"
            :aria-label="item.definitive ? 'Definitivo' : 'No definitivo'"
            :class="['definitive-dot', { 'definitive-dot--on': item.definitive }]"
          />
        </template>
      </v-tooltip>
    </template>

    <template #item.statusName="{ item }">
      <v-chip size="small" variant="tonal" :color="item.statusColor">
        {{ item.statusName }}
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <ActionsMenu
        :record="item"
        @view="viewDetail(item)"
        @approve="askDecision(item.requestId, 'APPROVE')"
        @validate="askDecision(item.requestId, 'VALIDATE')"
        @reject="askDecision(item.requestId, 'REJECT')"
        @annul="askAnnul(item.id)"
      />
    </template>

    <template #bottom>
      <ListFooter
        v-model:page="pageModel"
        v-model:size="sizeModel"
        :total="totalItems"
        :page-count="pageCount"
      />
    </template>
  </v-data-table-server>

  <FiltersDrawer
    v-model:open="filtersOpen"
    v-model:values="filterValues"
    :fields="filterFields"
    @clear="clearAllFilters"
  />

  <TerminationDetailDrawer
    v-model:open="detailDrawerOpen"
    :termination="selectedTermination ?? null"
    :approvals="selectedRequest?.approvals"
    :loading="detailLoading"
    @approve="askDecision($event.requestId, 'APPROVE')"
    @validate="askDecision($event.requestId, 'VALIDATE')"
    @reject="askDecision($event.requestId, 'REJECT')"
    @annul="askAnnul($event.id)"
  />

  <ApproveRejectDialog
    :ref="setDecisionDialogRef"
    :type="decisionType"
    :loading="decisionPending"
    :reason-options="rejectionReasons ?? []"
    :error-fields="decisionErrorFields"
    @confirm="confirmDecision"
  />

  <AnnulTerminationDialog
    :ref="setAnnulDialogRef"
    :loading="isAnnulling"
    :error-fields="annulErrorFields"
    @confirm="confirmAnnul"
  />
</template>

<style scoped>
.definitive-dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 1.4px solid rgba(var(--v-theme-on-surface), 0.38);
  border-radius: 50%;
  vertical-align: middle;
}

.definitive-dot--on {
  border-color: rgb(var(--v-theme-error));
  background: rgb(var(--v-theme-error));
}
</style>
