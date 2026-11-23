<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import {
  ANNEX_REJECTION_SUBMODULE,
  getAnnexDetailAction,
  getAnnexListAction,
  getAnnexStatusOptionsAction,
  getAnnexTypeOptionsAction,
  getCostCenterOptionsAction,
  getRequestDetailAction,
} from '@/actions'
import { useActiveFilters } from '@/composables/useActiveFilters'
import { useDetailSlide } from '@/composables/useDetailSlide'
import { useListQuery } from '@/composables/useListQuery'
import { usePermissions } from '@/composables/usePermissions'
import { useRequestDecision } from '@/composables/useRequestDecision'
import { useRetrySync } from '@/composables/useRetrySync'
import {
  annexQueryToRoute,
  parseAnnexQuery,
  type AnnexListItem,
  type AnnexQueryParams,
} from '@/models'
import { ROUTE } from '@/router/route-names'
import ListControls from '@/components/common/ListControls.vue'
import ActiveFilters from '@/components/common/ActiveFilters.vue'
import FiltersDrawer, { type FilterField } from '@/components/common/FiltersDrawer.vue'
import AnnexDetailDrawer from '@/components/detail/AnnexDetailDrawer.vue'
import ListFooter from '@/components/common/ListFooter.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'
import ApproveRejectDialog from '@/components/common/ApproveRejectDialog.vue'

const router = useRouter()
const { hasPermission } = usePermissions()
const canCreate = computed(() => hasPermission('create'))

const {
  detailQueryParam,
  isOpen: detailDrawerOpen,
  open: openDetail,
  record: selectedAnnex,
  isLoading: detailLoading,
} = useDetailSlide('annexes', getAnnexDetailAction)

const {
  query,
  patchQuery,
  searchInput,
  sortBy,
  changeSort,
  pageModel,
  sizeModel,
  items,
  totalItems,
  pageCount,
  isPending,
  isError,
} = useListQuery<AnnexQueryParams, AnnexListItem>({
  resource: 'annexes',
  parse: parseAnnexQuery,
  toRoute: annexQueryToRoute,
  fetch: getAnnexListAction,
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
} = useRequestDecision(
  ANNEX_REJECTION_SUBMODULE,
  async (id) => (await getAnnexDetailAction(id)).status.code,
)

const { retrySync } = useRetrySync()

const filtersOpen = ref(false)

const { data: statusOptions } = useQuery({
  queryKey: ['annexes', 'options', 'statuses'],
  queryFn: getAnnexStatusOptionsAction,
})
const { data: typeOptions } = useQuery({
  queryKey: ['annexes', 'options', 'types'],
  queryFn: getAnnexTypeOptionsAction,
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
    key: 'annexTypeId',
    type: 'select',
    label: 'Tipo de anexo',
    options: (typeOptions.value ?? []).map((o) => ({ title: o.name, value: o.id })),
  },
  {
    key: 'projectId',
    type: 'autocomplete',
    label: 'Centro de costo',
    options: (costCenterOptions.value ?? []).map((o) => ({ title: o.title, value: o.id })),
  },
])

const filterValues = computed<Record<string, unknown>>({
  get: () => ({
    statusId: query.value.statusId,
    annexTypeId: query.value.annexTypeId,
    projectId: query.value.projectId,
  }),
  set: (value) => {
    patchQuery({
      statusId: (value.statusId as number | null) ?? null,
      annexTypeId: (value.annexTypeId as number | null) ?? null,
      projectId: (value.projectId as number | null) ?? null,
    })
  },
})

const { activeFilters, clearFilter, clearAllFilters } = useActiveFilters<AnnexQueryParams>({
  patchQuery,
  resetAll: { statusId: null, annexTypeId: null, projectId: null },
  chips: () => {
    const chips = []
    const statusName = statusOptions.value?.find((o) => o.id === query.value.statusId)?.name
    if (statusName) chips.push({ key: 'statusId', label: `Estado: ${statusName}` })
    const typeName = typeOptions.value?.find((o) => o.id === query.value.annexTypeId)?.name
    if (typeName) chips.push({ key: 'annexTypeId', label: `Tipo: ${typeName}` })
    const costCenter = costCenterOptions.value?.find((o) => o.id === query.value.projectId)?.title
    if (costCenter) chips.push({ key: 'projectId', label: `Centro de costo: ${costCenter}` })
    return chips
  },
})

const headers = [
  { title: 'CC', key: 'costCenterCode', sortable: true },
  { title: 'Colaborador', key: 'fullName', sortable: true },
  { title: 'RUT', key: 'identificationNumber', sortable: true },
  { title: 'Tipo', key: 'annexTypeName', sortable: true },
  { title: 'Cambio', key: 'change', sortable: false },
  { title: 'Vigencia', key: 'effectiveDate', sortable: true },
  { title: 'Estado', key: 'statusName', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]

const { data: selectedRequest } = useQuery({
  queryKey: computed(() => ['requests', 'detail', selectedAnnex.value?.requestId]),
  queryFn: () => {
    const id = selectedAnnex.value?.requestId
    if (id === undefined) throw new Error('No hay solicitud asociada al anexo')
    return getRequestDetailAction(id)
  },
  enabled: computed(() => selectedAnnex.value !== undefined),
})

function viewDetail(item: { id: number }) {
  openDetail(item.id)
}

function openRequestForm() {
  void router.push({ name: ROUTE.ANNEX_NEW })
}

function openEditForm(id: number) {
  void router.push({ name: ROUTE.ANNEX_EDIT, params: { id } })
}
</script>

<template>
  <div class="mb-6">
    <h1 class="text-h5 font-weight-bold">Lista de anexos</h1>
    <p class="text-body-2 text-medium-emphasis mt-1">Anexos de contrato de los colaboradores registrados en el sistema.</p>
  </div>

  <ListControls
    v-model:search="searchInput"
    search-placeholder="Buscar por RUT o nombre"
    new-label="Solicitar"
    :show-export="false"
    :show-new="canCreate"
    @filter="filtersOpen = true"
    @new="openRequestForm"
  />

  <ActiveFilters
    :filters="activeFilters"
    @remove-filter="clearFilter"
    @clear-all="clearAllFilters"
  />

  <v-alert v-if="isError" type="error" variant="tonal" density="compact" class="mb-4 text-caption">
    No se pudo cargar la lista de anexos.
  </v-alert>

  <v-data-table-server
    mobile-breakpoint="md"
    :page="query.page"
    :items-per-page="query.size"
    :headers="headers"
    :items="items"
    :items-length="totalItems"
    :loading="isPending"
    :sort-by="sortBy"
    :multi-sort="false"
    must-sort
    @update:sort-by="changeSort"
  >
    <template #item.fullName="{ item }">
      <span class="link-cell" @click="viewDetail(item)">{{ item.fullName }}</span>
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
        @edit="openEditForm(item.id)"
        @approve="askDecision(item.requestId, 'APPROVE', item.id)"
        @validate="askDecision(item.requestId, 'VALIDATE', item.id)"
        @reject="askDecision(item.requestId, 'REJECT', item.id)"
        @retry-sync="retrySync(item.requestId)"
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

  <AnnexDetailDrawer
    v-model:open="detailDrawerOpen"
    :annex="selectedAnnex ?? null"
    :approvals="selectedRequest?.approvals"
    :loading="detailLoading"
    @edit="openEditForm($event.id)"
    @approve="askDecision($event.requestId, 'APPROVE', $event.id)"
    @validate="askDecision($event.requestId, 'VALIDATE', $event.id)"
    @reject="askDecision($event.requestId, 'REJECT', $event.id)"
    @retry-sync="retrySync($event.requestId)"
  />

  <ApproveRejectDialog
    :ref="setDecisionDialogRef"
    :type="decisionType"
    :loading="decisionPending"
    :reason-options="rejectionReasons ?? []"
    :error-fields="decisionErrorFields"
    @confirm="confirmDecision"
  />
</template>
