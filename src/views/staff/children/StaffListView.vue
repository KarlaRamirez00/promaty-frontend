<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import {
  getCostCenterOptionsAction,
  getStaffDetailAction,
  getStaffListAction,
  getStaffStatusOptionsAction,
} from '@/actions'
import { useActiveFilters } from '@/composables/useActiveFilters'
import { useDetailSlide } from '@/composables/useDetailSlide'
import { useListQuery } from '@/composables/useListQuery'
import { usePermissions } from '@/composables/usePermissions'
import { useStaffBlock } from '@/composables/useStaffBlock'
import { ROUTE } from '@/router/route-names'
import {
  parseStaffQuery,
  STAFF_STATUS_CODE,
  staffQueryToRoute,
  type StaffListItem,
  type StaffQueryParams,
} from '@/models'
import ActiveFilters from '@/components/common/ActiveFilters.vue'
import FiltersDrawer, { type FilterField } from '@/components/common/FiltersDrawer.vue'
import ListControls from '@/components/common/ListControls.vue'
import StaffDetailDrawer from '@/components/detail/StaffDetailDrawer.vue'
import BlockStaffDialog from '@/components/common/BlockStaffDialog.vue'
import ListFooter from '@/components/common/ListFooter.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'

const router = useRouter()
const { hasPermission } = usePermissions()
const canCreate = computed(() => hasPermission('create'))

const {
  detailQueryParam,
  isOpen: detailDrawerOpen,
  open: openDetail,
  record: selectedStaff,
  isLoading: detailLoading,
} = useDetailSlide('staff', getStaffDetailAction)

const {
  setDialogRef: setBlockDialogRef,
  type: blockType,
  backendErrorFields: blockErrorFields,
  isPending: isBlocking,
  askBlock,
  askUnblock,
  confirmChange,
} = useStaffBlock()

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
} = useListQuery<StaffQueryParams, StaffListItem>({
  resource: 'staff',
  parse: parseStaffQuery,
  toRoute: staffQueryToRoute,
  fetch: getStaffListAction,
  extraRouteQuery: () => detailQueryParam.value,
})

const filtersOpen = ref(false)

const { data: statusOptions } = useQuery({
  queryKey: ['staff', 'statusOptions'],
  queryFn: getStaffStatusOptionsAction,
})
const { data: costCenterOptions } = useQuery({
  queryKey: ['projects', 'options', 'costCenters'],
  queryFn: getCostCenterOptionsAction,
})

const filterFields = computed<FilterField[]>(() => [
  {
    key: 'statusCode',
    type: 'select',
    label: 'Estado',
    options: (statusOptions.value ?? []).map((o) => ({ title: o.name, value: o.code })),
  },
  {
    key: 'costCenterCode',
    type: 'autocomplete',
    label: 'Centro de costo',
    options: (costCenterOptions.value ?? []).map((o) => ({ title: o.title, value: o.code })),
  },
])

const filterValues = computed<Record<string, unknown>>({
  get: () => ({
    statusCode: query.value.statusCode,
    costCenterCode: query.value.costCenterCode,
  }),
  set: (value) => {
    patchQuery({
      statusCode: (value.statusCode as string | null) ?? null,
      costCenterCode: (value.costCenterCode as string | null) ?? null,
    })
  },
})

const { activeFilters, clearFilter, clearAllFilters } = useActiveFilters<StaffQueryParams>({
  patchQuery,
  resetAll: { statusCode: null, costCenterCode: null },
  chips: () => {
    const chips = []
    const statusName = statusOptions.value?.find((o) => o.code === query.value.statusCode)?.name
    const costCenter = costCenterOptions.value?.find((o) => o.code === query.value.costCenterCode)?.title
    if (statusName) chips.push({ key: 'statusCode', label: `Estado: ${statusName}` })
    if (costCenter) chips.push({ key: 'costCenterCode', label: `Centro de costo: ${costCenter}` })
    return chips
  },
})

const headers = [
  { title: 'CC', key: 'costCenterCode', sortable: false },
  { title: 'Nombre', key: 'firstName', sortable: true },
  { title: 'RUT', key: 'identificationNumber', sortable: true },
  { title: 'Fecha ingreso', key: 'hireDate', sortable: false },
  { title: 'Estado', key: 'statusName', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]

function viewDetail(item: { id: number }) {
  openDetail(item.id)
}

function openCreateForm() {
  router.push({ name: ROUTE.STAFF_NEW })
}

function openEditForm(item: { id: number }) {
  router.push({ name: ROUTE.STAFF_EDIT, params: { id: String(item.id) } })
}
</script>

<template>
  <div class="mb-6">
    <h1 class="text-h5 font-weight-bold">Lista de colaboradores</h1>
    <p class="text-body-2 text-medium-emphasis mt-1">
      Colaboradores registrados en el sistema.
    </p>
  </div>

  <ListControls
    v-model:search="searchInput"
    search-placeholder="Buscar por nombre o identificación"
    new-label="Nuevo"
    :show-export="false"
    :show-new="canCreate"
    @filter="filtersOpen = true"
    @new="openCreateForm"
  />

  <ActiveFilters :filters="activeFilters" @remove-filter="clearFilter" @clear-all="clearAllFilters" />

  <v-alert v-if="isError" type="error" variant="tonal" density="compact" class="mb-4 text-caption">
    No se pudo cargar la lista de colaboradores.
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
    <template #item.firstName="{ item }">
      <span class="link-cell" @click="viewDetail(item)">{{ item.fullName }}</span>
    </template>

    <template #item.identificationNumber="{ item }">
      {{ item.identificationNumber }}
    </template>

    <template #item.statusName="{ item }">
      <v-chip size="small" variant="tonal" :color="item.statusColor">
        {{ item.statusName }}
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <ActionsMenu
        :record="item"
        :blockable="item.statusCode === STAFF_STATUS_CODE.ACTIVE"
        :unblockable="item.statusCode === STAFF_STATUS_CODE.BLOCKED"
        @view="viewDetail(item)"
        @edit="openEditForm(item)"
        @block="askBlock(item.id)"
        @unblock="askUnblock(item.id)"
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

  <StaffDetailDrawer
    v-model:open="detailDrawerOpen"
    :staff="selectedStaff ?? null"
    :loading="detailLoading"
    @edit="openEditForm"
    @block="askBlock($event.id)"
    @unblock="askUnblock($event.id)"
  />

  <BlockStaffDialog
    :ref="setBlockDialogRef"
    :type="blockType"
    :loading="isBlocking"
    :error-fields="blockErrorFields"
    @confirm="confirmChange"
  />
</template>

<style scoped>
:deep(.v-data-table-header__sort-icon) {
  font-size: 1.125rem;
}
</style>
