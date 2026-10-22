<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { mdiAlertCircleOutline, mdiClockOutline } from '@mdi/js'
import {
  getCostCenterOptionsAction,
  getRequesterOptionsAction,
  getRequestListAction,
  getRequestStatusOptionsAction,
} from '@/actions'
import { useActiveFilters } from '@/composables/useActiveFilters'
import { useListQuery } from '@/composables/useListQuery'
import {
  parseRequestQuery,
  requestQueryToRoute,
  type RequestQueryParams,
} from '@/models'
import { ROUTE } from '@/router/route-names'
import { formatDate } from '@/utils'
import ListControls from '@/components/common/ListControls.vue'
import ActiveFilters from '@/components/common/ActiveFilters.vue'
import FiltersDrawer, { type FilterField } from '@/components/common/FiltersDrawer.vue'
import IndicatorCard from '@/components/common/IndicatorCard.vue'
import ListFooter from '@/components/common/ListFooter.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'

const router = useRouter()

const {
  query,
  patchQuery,
  searchInput,
  pageModel,
  sizeModel,
  listResult,
  items,
  totalItems,
  pageCount,
  isPending,
  isError,
} = useListQuery({
  resource: 'requests',
  parse: parseRequestQuery,
  toRoute: requestQueryToRoute,
  fetch: getRequestListAction,
})

const filtersOpen = ref(false)

const { data: statusOptions } = useQuery({
  queryKey: ['requests', 'options', 'statuses'],
  queryFn: getRequestStatusOptionsAction,
})
const { data: costCenterOptions } = useQuery({
  queryKey: ['projects', 'options', 'costCenters'],
  queryFn: getCostCenterOptionsAction,
})
const { data: requesterOptions } = useQuery({
  queryKey: ['requests', 'options', 'requesters'],
  queryFn: getRequesterOptionsAction,
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
  {
    key: 'requesterUserId',
    type: 'autocomplete',
    label: 'Solicitante',
    options: (requesterOptions.value ?? []).map((o) => ({ title: o.name, value: o.id })),
  },
  { key: 'dateRange', type: 'date', label: 'Rango de fechas', range: true },
])

const filterValues = computed<Record<string, unknown>>({
  get: () => ({
    statusId: query.value.statusId,
    projectId: query.value.projectId,
    requesterUserId: query.value.requesterUserId,
    dateRange:
      query.value.createdFrom && query.value.createdTo
        ? [query.value.createdFrom, query.value.createdTo]
        : null,
  }),
  set: (value) => {
    const range = value.dateRange as [string, string] | null | undefined
    patchQuery({
      statusId: (value.statusId as number | null) ?? null,
      projectId: (value.projectId as number | null) ?? null,
      requesterUserId: (value.requesterUserId as number | null) ?? null,
      createdFrom: range?.[0] ?? null,
      createdTo: range?.[1] ?? null,
    })
  },
})

const { activeFilters, clearFilter, clearAllFilters } = useActiveFilters<RequestQueryParams>({
  patchQuery,
  resetAll: {
    statusId: null,
    projectId: null,
    requesterUserId: null,
    createdFrom: null,
    createdTo: null,
  },
  chips: () => {
    const chips = []
    const statusName = statusOptions.value?.find((o) => o.id === query.value.statusId)?.name
    if (statusName) chips.push({ key: 'statusId', label: `Estado: ${statusName}` })
    const costCenter = costCenterOptions.value?.find((o) => o.id === query.value.projectId)?.title
    if (costCenter) chips.push({ key: 'projectId', label: `Centro de costo: ${costCenter}` })
    const requesterName = requesterOptions.value?.find(
      (o) => o.id === query.value.requesterUserId,
    )?.name
    if (requesterName) chips.push({ key: 'requesterUserId', label: `Solicitante: ${requesterName}` })
    if (query.value.createdFrom && query.value.createdTo) {
      chips.push({
        key: 'dateRange',
        label: `Fechas: ${formatDate(query.value.createdFrom)} a ${formatDate(query.value.createdTo)}`,
        reset: { createdFrom: null, createdTo: null },
      })
    }
    return chips
  },
})

const pendingApproval = computed(() => listResult.value?.meta.otherData?.pendingApproval ?? 0)
const pendingValidation = computed(() => listResult.value?.meta.otherData?.pendingValidation ?? 0)

function statusIdByCode(code: string): number | null {
  return statusOptions.value?.find((o) => o.code === code)?.id ?? null
}

function isCounterActive(code: string): boolean {
  const id = statusIdByCode(code)
  return id !== null && query.value.statusId === id
}

function toggleCounter(code: string) {
  const id = statusIdByCode(code)
  if (id === null) return
  patchQuery({ statusId: query.value.statusId === id ? null : id })
}

const headers = [
  { title: 'CC', key: 'costCenterCode', sortable: false },
  { title: 'Tipo de solicitud', key: 'typeName', sortable: false },
  { title: 'Colaborador', key: 'staffFullName', sortable: false },
  { title: 'RUT', key: 'staffIdentificationNumber', sortable: false },
  { title: 'Cargo', key: 'staffPosition', sortable: false },
  { title: 'Solicitante', key: 'requesterName', sortable: false },
  { title: 'Creación', key: 'createdAt', sortable: false },
  { title: 'Estado', key: 'status', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]

// El detalle es único: vive en Contratos y se abre con ?detail={id del contrato}.
function viewDetail(item: { entityId: number | null }) {
  if (item.entityId === null) return
  router.push({ name: ROUTE.CONTRACT_LIST, query: { detail: String(item.entityId) } })
}
</script>

<template>
  <div class="list-header mb-6">
    <div class="list-header__text">
      <h1 class="text-h5 font-weight-bold">Lista de solicitudes</h1>
      <p class="text-body-2 text-medium-emphasis mt-1">
        Revisa las solicitudes pendientes de <strong>aprobación</strong> y <strong>revisión</strong>.
      </p>
    </div>

    <div class="list-header__indicators">
      <IndicatorCard
        :icon="mdiAlertCircleOutline"
        color="warning"
        title="Por aprobar"
        :count="pendingApproval"
        :class="['indicator', { 'indicator--active': isCounterActive('PENDING_APPROVAL') }]"
        role="button"
        tabindex="0"
        @click="toggleCounter('PENDING_APPROVAL')"
        @keydown.enter="toggleCounter('PENDING_APPROVAL')"
        @keydown.space.prevent="toggleCounter('PENDING_APPROVAL')"
      />
      <IndicatorCard
        :icon="mdiClockOutline"
        color="info"
        title="Por validar"
        :count="pendingValidation"
        :class="['indicator', { 'indicator--active': isCounterActive('PENDING_VALIDATION') }]"
        role="button"
        tabindex="0"
        @click="toggleCounter('PENDING_VALIDATION')"
        @keydown.enter="toggleCounter('PENDING_VALIDATION')"
        @keydown.space.prevent="toggleCounter('PENDING_VALIDATION')"
      />
    </div>
  </div>

  <ListControls
    v-model:search="searchInput"
    search-placeholder="Buscar por colaborador, RUT o centro de costo"
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
    No se pudo cargar la lista de solicitudes.
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
    <template #item.typeName="{ item }">
      <span class="link-cell" @click="viewDetail(item)">{{ item.typeName }}</span>
    </template>

    <template #item.status="{ item }">
      <v-chip size="small" variant="tonal" :color="item.statusColor">
        {{ item.status.name }}
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <ActionsMenu
        :record="item"
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

  <FiltersDrawer
    v-model:open="filtersOpen"
    v-model:values="filterValues"
    :fields="filterFields"
    @clear="clearAllFilters"
  />
</template>

<style scoped>
.list-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-header__indicators {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.indicator {
  cursor: pointer;
  user-select: none;
}

.indicator--active {
  outline: 2px solid rgba(var(--v-theme-on-surface), 0.38);
}

@media (min-width: 600px) {
  .list-header__indicators {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .list-header__indicators > * {
    flex: 1 1 200px;
  }
}

@media (min-width: 960px) {
  .list-header {
    flex-direction: row;
    align-items: flex-start;
    gap: 24px;
  }

  .list-header__text {
    flex: 1 1 auto;
  }

  .list-header__indicators {
    flex: 0 1 480px;
  }
}

</style>
