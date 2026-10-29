<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import {
  getContractDetailAction,
  getContractListAction,
  getContractStatusOptionsAction,
  getContractTypeOptionsAction,
  getCostCenterOptionsAction,
  getRequestDetailAction,
} from '@/actions'
import { useActiveFilters } from '@/composables/useActiveFilters'
import { useDetailSlide } from '@/composables/useDetailSlide'
import { useListQuery } from '@/composables/useListQuery'
import { usePermissions } from '@/composables/usePermissions'
import { useRequestDecision } from '@/composables/useRequestDecision'
import {
  contractQueryToRoute,
  parseContractQuery,
  type ContractListItem,
  type ContractQueryParams,
} from '@/models'
import { ROUTE } from '@/router/route-names'
import ListControls from '@/components/common/ListControls.vue'
import ActiveFilters from '@/components/common/ActiveFilters.vue'
import FiltersDrawer, { type FilterField } from '@/components/common/FiltersDrawer.vue'
import ContractDetailDrawer from '@/components/detail/ContractDetailDrawer.vue'
import ListFooter from '@/components/common/ListFooter.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'
import ApproveRejectDialog from '@/components/common/ApproveRejectDialog.vue'

const router = useRouter()
const { hasPermission } = usePermissions()
const canCreate = computed(() => hasPermission('create'))

const {
  setDialogRef: setDecisionDialogRef,
  type: decisionType,
  rejectionReasons,
  backendErrorFields,
  isPending: decisionPending,
  askDecision,
  confirmDecision,
} = useRequestDecision()

const {
  detailQueryParam,
  isOpen: detailDrawerOpen,
  open: openDetail,
  record: selectedContract,
  isLoading: detailLoading,
} = useDetailSlide('contracts', getContractDetailAction)

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
} = useListQuery<ContractQueryParams, ContractListItem>({
  resource: 'contracts',
  parse: parseContractQuery,
  toRoute: contractQueryToRoute,
  fetch: getContractListAction,
  extraRouteQuery: () => detailQueryParam.value,
})

const filtersOpen = ref(false)

const { data: statusOptions } = useQuery({
  queryKey: ['contracts', 'options', 'statuses'],
  queryFn: getContractStatusOptionsAction,
})
const { data: contractTypeOptions } = useQuery({
  queryKey: ['contractTypes', 'options'],
  queryFn: getContractTypeOptionsAction,
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
    key: 'contractTypeId',
    type: 'select',
    label: 'Tipo de contrato',
    options: (contractTypeOptions.value ?? []).map((o) => ({ title: o.name, value: o.id })),
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
    contractTypeId: query.value.contractTypeId,
    projectId: query.value.projectId,
  }),
  set: (value) => {
    patchQuery({
      statusId: (value.statusId as number | null) ?? null,
      contractTypeId: (value.contractTypeId as number | null) ?? null,
      projectId: (value.projectId as number | null) ?? null,
    })
  },
})

const { activeFilters, clearFilter, clearAllFilters } = useActiveFilters<ContractQueryParams>({
  patchQuery,
  resetAll: { statusId: null, contractTypeId: null, projectId: null },
  chips: () => {
    const chips = []
    const statusName = statusOptions.value?.find((o) => o.id === query.value.statusId)?.name
    if (statusName) chips.push({ key: 'statusId', label: `Estado: ${statusName}` })
    const contractTypeName = contractTypeOptions.value?.find(
      (o) => o.id === query.value.contractTypeId,
    )?.name
    if (contractTypeName) {
      chips.push({ key: 'contractTypeId', label: `Tipo de contrato: ${contractTypeName}` })
    }
    const costCenter = costCenterOptions.value?.find((o) => o.id === query.value.projectId)?.title
    if (costCenter) chips.push({ key: 'projectId', label: `Centro de costo: ${costCenter}` })
    return chips
  },
})

const headers = [
  { title: 'CC', key: 'costCenterCode', sortable: false },
  { title: 'Tipo de contrato', key: 'contractTypeName', sortable: false },
  { title: 'Cargo', key: 'jobTitleName', sortable: false },
  { title: 'RUT', key: 'identificationNumber', sortable: false },
  { title: 'Nombre', key: 'fullName', sortable: false },
  { title: 'Fecha de inicio', key: 'startDate', sortable: false },
  { title: 'Fecha de término', key: 'endDate', sortable: false },
  { title: 'Sueldo pactado', key: 'agreedSalary', sortable: false },
  { title: 'Estado', key: 'statusName', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]

// El historial de aprobaciones vive en la solicitud asociada al contrato.
const { data: selectedRequest } = useQuery({
  queryKey: computed(() => ['requests', 'detail', selectedContract.value?.requestId]),
  queryFn: () => {
    const id = selectedContract.value?.requestId
    if (id === undefined) throw new Error('No hay solicitud asociada al contrato')
    return getRequestDetailAction(id)
  },
  enabled: computed(() => selectedContract.value !== undefined),
})

function viewDetail(item: { id: number }) {
  openDetail(item.id)
}


function openRequestForm() {
  router.push({ name: ROUTE.CONTRACT_NEW })
}
</script>

<template>
  <div class="mb-6">
    <h1 class="text-h5 font-weight-bold">Lista de contratos</h1>
    <p class="text-body-2 text-medium-emphasis mt-1">Contratos de los colaboradores registrados en el sistema.</p>
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
    No se pudo cargar la lista de contratos.
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
    <template #item.contractTypeName="{ item }">
      <span class="link-cell" @click="viewDetail(item)">{{ item.contractTypeName }}</span>
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

  <ContractDetailDrawer
    v-model:open="detailDrawerOpen"
    :contract="selectedContract ?? null"
    :approvals="selectedRequest?.approvals"
    :loading="detailLoading"
    @approve="askDecision($event.requestId, 'APPROVE')"
    @validate="askDecision($event.requestId, 'VALIDATE')"
    @reject="askDecision($event.requestId, 'REJECT')"
  />

  <ApproveRejectDialog
    :ref="setDecisionDialogRef"
    :type="decisionType"
    :loading="decisionPending"
    :reason-options="rejectionReasons ?? []"
    :error-fields="backendErrorFields"
    @confirm="confirmDecision"
  />
</template>

