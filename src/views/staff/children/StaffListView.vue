<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import {
  getCostCenterOptionsAction,
  getStaffDetailAction,
  getStaffListAction,
  getStaffStatusOptionsAction,
} from '@/actions'
import { useDetailSlide } from '@/composables/useDetailSlide'
import { usePermissions } from '@/composables/usePermissions'
import { useStaffBlock } from '@/composables/useStaffBlock'
import { ROUTE } from '@/router/route-names'
import {
  identificationTypeLabel,
  parseStaffQuery,
  STAFF_STATUS_CODE,
  staffQueryToRoute,
  type StaffListItem,
  type StaffQueryParams,
  type StaffSort,
} from '@/models'
import ActiveFilters from '@/components/common/ActiveFilters.vue'
import FiltersDrawer, { type FilterField } from '@/components/common/FiltersDrawer.vue'
import ListControls from '@/components/common/ListControls.vue'
import StaffDetailDrawer from '@/components/detail/StaffDetailDrawer.vue'
import BlockStaffDialog from '@/components/common/BlockStaffDialog.vue'
import ListFooter from '@/components/common/ListFooter.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'

const route = useRoute()
const router = useRouter()
const { hasPermission } = usePermissions()
const canCreate = computed(() => hasPermission('create'))

const query = computed<StaffQueryParams>(() => parseStaffQuery(route.query))

// Encadena patches del mismo tick sobre el último estado pedido, no sobre la ruta aún sin propagar.
let pendingQuery: StaffQueryParams | null = null

function patchQuery(patch: Partial<StaffQueryParams>) {
  const next: StaffQueryParams = { ...(pendingQuery ?? query.value), ...patch }
  if (!('page' in patch)) next.page = 1
  pendingQuery = next
  void router.replace({ query: { ...staffQueryToRoute(next), ...detailQueryParam.value } }).finally(() => {
    pendingQuery = null
  })
}

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

const searchInput = ref(query.value.search)
let debounceTimer: ReturnType<typeof setTimeout>
watch(searchInput, (value) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => patchQuery({ search: value }), 350)
})
watch(
  () => query.value.search,
  (value) => {
    if (value !== searchInput.value.trim()) searchInput.value = value
  },
)

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

const activeFilters = computed(() => {
  const active: { key: string; label: string }[] = []
  const statusName = statusOptions.value?.find((o) => o.code === query.value.statusCode)?.name
  const costCenter = costCenterOptions.value?.find((o) => o.code === query.value.costCenterCode)?.title
  if (statusName) active.push({ key: 'statusCode', label: `Estado: ${statusName}` })
  if (costCenter) active.push({ key: 'costCenterCode', label: `Centro de costo: ${costCenter}` })
  return active
})

function clearFilter(key: string) {
  patchQuery({ [key]: null })
}

function clearAllFilters() {
  patchQuery({ statusCode: null, costCenterCode: null })
}

const sort = computed<StaffSort>(() => query.value.sort)
const sortBy = computed(() => [{ key: sort.value.key, order: sort.value.order }])

function changeSort(value: readonly { key: string; order?: boolean | 'asc' | 'desc' }[]) {
  const entry = value[0]
  if (!entry) return
  patchQuery({ sort: { key: entry.key, order: entry.order === 'desc' ? 'desc' : 'asc' } })
}

const pageModel = computed<number>({
  get: () => query.value.page,
  set: (value) => patchQuery({ page: value }),
})

const sizeModel = computed<number>({
  get: () => query.value.size,
  set: (value) => patchQuery({ size: value }),
})

const listQueryKey = computed(() => ['staff', { ...query.value }])

const { data: listResult, isPending, isError } = useQuery({
  queryKey: listQueryKey,
  queryFn: () => getStaffListAction({ ...query.value }),
  placeholderData: keepPreviousData,
})

const items = computed<StaffListItem[]>(() => listResult.value?.data ?? [])
const totalItems = computed(() => listResult.value?.meta.total ?? 0)
const pageCount = computed(() => listResult.value?.meta.pageCount ?? 1)

watch(pageCount, (count) => {
  if (count >= 1 && query.value.page > count) patchQuery({ page: count })
})

const headers = [
  { title: 'CC', key: 'costCenterCode', sortable: false },
  { title: 'Nombre', key: 'firstName', sortable: true },
  { title: 'Tipo de identificación', key: 'identificationType', sortable: false },
  { title: 'N° de identificación', key: 'identificationNumber', sortable: true },
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

    <template #item.identificationType="{ item }">
      {{ identificationTypeLabel(item.identificationType) }}
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
