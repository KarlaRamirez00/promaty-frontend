<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import {
  getContractDetailAction,
  getContractListAction,
  getContractStatusOptionsAction,
  getCostCenterOptionsAction,
} from '@/actions'
import { usePermissions } from '@/composables/usePermissions'
import {
  contractQueryToRoute,
  contractStatusColor,
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
import AlertComponent from '@/components/common/AlertComponent.vue'

const { smAndDown } = useDisplay()
const route = useRoute()
const router = useRouter()
const { hasPermission } = usePermissions()
const canCreate = computed(() => hasPermission('create'))

const query = computed<ContractQueryParams>(() => parseContractQuery(route.query))

// Encadena patches del mismo tick sobre el último estado pedido, no sobre la ruta aún sin propagar.
let pendingQuery: ContractQueryParams | null = null

function patchQuery(patch: Partial<ContractQueryParams>) {
  const next: ContractQueryParams = { ...(pendingQuery ?? query.value), ...patch }
  if (!('page' in patch)) next.page = 1
  pendingQuery = next
  void router
    .replace({ query: { ...contractQueryToRoute(next), ...detailQueryParam.value } })
    .finally(() => {
      pendingQuery = null
    })
}

// Detalle abierto vía ?detail={id}: sobrevive a un refresh y es compartible por link.
const detailId = computed(() => {
  const raw = route.query.detail
  const n = Number(raw)
  return typeof raw === 'string' && Number.isInteger(n) && n > 0 ? n : null
})

const detailQueryParam = computed(() => (detailId.value ? { detail: String(detailId.value) } : {}))

const detailDrawerOpen = computed<boolean>({
  get: () => detailId.value !== null,
  set: (value) => {
    if (!value) closeDetail()
  },
})

function openDetail(id: number) {
  router.push({ query: { ...route.query, detail: String(id) } })
}

function closeDetail() {
  const rest = { ...route.query }
  delete rest.detail
  router.push({ query: rest })
}

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
  queryKey: ['contracts', 'options', 'statuses'],
  queryFn: getContractStatusOptionsAction,
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
])

const filterValues = computed<Record<string, unknown>>({
  get: () => ({
    statusId: query.value.statusId,
    projectId: query.value.projectId,
  }),
  set: (value) => {
    patchQuery({
      statusId: (value.statusId as number | null) ?? null,
      projectId: (value.projectId as number | null) ?? null,
    })
  },
})

const activeFilters = computed(() => {
  const active: { key: string; label: string }[] = []
  const statusName = statusOptions.value?.find((o) => o.id === query.value.statusId)?.name
  if (statusName) active.push({ key: 'statusId', label: `Estado: ${statusName}` })
  const costCenter = costCenterOptions.value?.find((o) => o.id === query.value.projectId)?.title
  if (costCenter) active.push({ key: 'projectId', label: `Centro de costo: ${costCenter}` })
  return active
})

function clearFilter(key: string) {
  patchQuery({ [key]: null })
}

function clearAllFilters() {
  patchQuery({ statusId: null, projectId: null })
}

const pageModel = computed<number>({
  get: () => query.value.page,
  set: (value) => patchQuery({ page: value }),
})

const sizeModel = computed<number>({
  get: () => query.value.size,
  set: (value) => patchQuery({ size: value }),
})

const listQueryKey = computed(() => ['contracts', { ...query.value }])

const {
  data: listResult,
  isPending,
  isError,
} = useQuery({
  queryKey: listQueryKey,
  queryFn: () => getContractListAction({ ...query.value }),
  placeholderData: keepPreviousData,
})

const items = computed<ContractListItem[]>(() => listResult.value?.data ?? [])
const totalItems = computed(() => listResult.value?.meta.total ?? 0)
const pageCount = computed(() => listResult.value?.meta.pageCount ?? 1)

watch(pageCount, (count) => {
  if (count >= 1 && query.value.page > count) patchQuery({ page: count })
})

// La fila trae solo el nombre del estado; el código sale del catálogo para elegir el color.
function statusColor(statusName: string): string {
  const code = statusOptions.value?.find((o) => o.name === statusName)?.code
  return code ? contractStatusColor(code) : 'grey'
}

const headers = [
  { title: 'CC', key: 'costCenterCode', sortable: false },
  { title: 'Tipo de contrato', key: 'contractTypeName', sortable: false },
  { title: 'RUT', key: 'identificationNumber', sortable: false },
  { title: 'Nombre', key: 'fullName', sortable: false },
  { title: 'Fecha de inicio', key: 'startDate', sortable: false },
  { title: 'Fecha de término', key: 'endDate', sortable: false },
  { title: 'Estado', key: 'statusName', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]

const { data: selectedContract, isPending: detailLoading } = useQuery({
  queryKey: computed(() => ['contracts', 'detail', detailId.value]),
  queryFn: () => getContractDetailAction(detailId.value as number),
  enabled: computed(() => detailId.value !== null),
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
    v-if="!smAndDown"
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

    <template #item.statusName="{ item }">
      <v-chip size="small" variant="tonal" :color="statusColor(item.statusName)">
        {{ item.statusName }}
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <ActionsMenu
        :record="item"
        :has-update-permission="false"
        :has-active-permission="false"
        @view="viewDetail(item)"
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

  <template v-else>
    <v-card flat border>
      <template v-for="(item, index) in items" :key="item.id">
        <div class="pa-4" :class="{ 'contract-block--divided': index > 0 }">
          <div class="d-flex align-center justify-space-between ga-2 mb-3">
            <div class="d-flex flex-wrap align-center ga-2">
              <span class="link-cell text-subtitle-2 font-weight-bold" @click="viewDetail(item)">{{
                item.fullName
              }}</span>
              <v-chip size="small" variant="tonal" :color="statusColor(item.statusName)">
                {{ item.statusName }}
              </v-chip>
            </div>
            <ActionsMenu
              :record="item"
              :has-update-permission="false"
              :has-active-permission="false"
              @view="viewDetail(item)"
            />
          </div>

          <dl class="contract-block__fields">
            <div class="contract-block__field">
              <dt>RUT</dt>
              <dd>{{ item.identificationNumber }}</dd>
            </div>
            <div class="contract-block__field">
              <dt>CC</dt>
              <dd>{{ item.costCenterCode }}</dd>
            </div>
            <div class="contract-block__field">
              <dt>Tipo</dt>
              <dd>{{ item.contractTypeName }}</dd>
            </div>
            <div class="contract-block__field">
              <dt>Inicio</dt>
              <dd>{{ item.startDate }}</dd>
            </div>
            <div class="contract-block__field">
              <dt>Término</dt>
              <dd>{{ item.endDate }}</dd>
            </div>
          </dl>
        </div>
      </template>

      <AlertComponent
        v-if="!items.length && !isError"
        type="info"
        message="No hay contratos que coincidan con los filtros aplicados."
        class="ma-4"
      />
    </v-card>

    <ListFooter
      v-model:page="pageModel"
      v-model:size="sizeModel"
      :total="totalItems"
      :page-count="pageCount"
      class="mt-2"
    />
  </template>

  <FiltersDrawer
    v-model:open="filtersOpen"
    v-model:values="filterValues"
    :fields="filterFields"
    @clear="clearAllFilters"
  />

  <ContractDetailDrawer
    v-model:open="detailDrawerOpen"
    :contract="selectedContract ?? null"
    :loading="detailLoading"
  />
</template>

<style scoped>
.contract-block--divided {
  border-top: thin solid rgba(var(--v-theme-on-surface), 0.12);
}

.contract-block__fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
}

.contract-block__field {
  display: flex;
  flex-wrap: wrap;
  gap: 0.125rem 0.75rem;
}

.contract-block__field dt {
  min-width: 88px;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6);
  align-self: center;
}

.contract-block__field dd {
  margin: 0;
  font-size: 0.875rem;
}
</style>
