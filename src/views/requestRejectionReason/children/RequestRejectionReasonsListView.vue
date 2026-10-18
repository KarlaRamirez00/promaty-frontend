<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  getRequestRejectionReasonDetailAction,
  getRequestRejectionReasonListAction,
  toggleRequestRejectionReasonActiveAction,
} from '@/actions'
import { useActiveFilters } from '@/composables/useActiveFilters'
import { useDetailSlide } from '@/composables/useDetailSlide'
import { useListQuery } from '@/composables/useListQuery'
import { usePermissions } from '@/composables/usePermissions'
import { useRejectionReasonSubModules } from '@/composables/useRejectionReasonSubModules'
import { useToggleActive, type ToggleRecord } from '@/composables/useToggleActive'
import { ROUTE } from '@/router/route-names'
import messages from '@/messages'
import {
  parseRequestRejectionReasonQuery,
  requestRejectionReasonQueryToRoute,
  type RequestRejectionReasonListItem,
  type RequestRejectionReasonQueryParams,
} from '@/models'
import ListControls from '@/components/common/ListControls.vue'
import ActiveFilters from '@/components/common/ActiveFilters.vue'
import FiltersDrawer, { type FilterField } from '@/components/common/FiltersDrawer.vue'
import RequestRejectionReasonDetailDrawer from '@/components/detail/RequestRejectionReasonDetailDrawer.vue'
import ConfirmStatusDialog from '@/components/common/ConfirmStatusDialog.vue'
import ListFooter from '@/components/common/ListFooter.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'

const router = useRouter()
const { hasPermission } = usePermissions()
const canCreate = computed(() => hasPermission('create'))

const {
  detailQueryParam,
  isOpen: detailDrawerOpen,
  open: openDetail,
  close: closeDetail,
  record: selectedRequestRejectionReason,
  isLoading: detailLoading,
} = useDetailSlide('requestRejectionReasons', getRequestRejectionReasonDetailAction)

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
} = useListQuery<RequestRejectionReasonQueryParams, RequestRejectionReasonListItem>({
  resource: 'requestRejectionReasons',
  parse: parseRequestRejectionReasonQuery,
  toRoute: requestRejectionReasonQueryToRoute,
  fetch: getRequestRejectionReasonListAction,
  extraRouteQuery: () => detailQueryParam.value,
})

const filtersOpen = ref(false)

const { options: subModuleOptions, nameOf: subModuleName } = useRejectionReasonSubModules()

const filterFields = computed<FilterField[]>(() => [
  {
    key: 'active',
    type: 'select',
    label: 'Estado',
    options: [
      { title: 'Activos', value: true },
      { title: 'Inactivos', value: false },
    ],
  },
  { key: 'subModule', type: 'select', label: 'Submódulo', options: subModuleOptions.value },
])

const filterValues = computed<Record<string, unknown>>({
  get: () => ({ active: query.value.active, subModule: query.value.subModule }),
  set: (value) => {
    patchQuery({
      active: (value.active as boolean | null) ?? null,
      subModule: (value.subModule as string | null) ?? null,
    })
  },
})

const { activeFilters, clearFilter, clearAllFilters } =
  useActiveFilters<RequestRejectionReasonQueryParams>({
    patchQuery,
    resetAll: { active: null, subModule: null },
    chips: () => {
      const chips = []
      if (query.value.active !== null) {
        chips.push({ key: 'active', label: `Estado: ${query.value.active ? 'Activos' : 'Inactivos'}` })
      }
      if (query.value.subModule) {
        chips.push({ key: 'subModule', label: `Submódulo: ${subModuleName(query.value.subModule)}` })
      }
      return chips
    },
  })

const headers = [
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Submódulo', key: 'subModule', sortable: true },
  { title: 'Estado', key: 'active', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]

function viewDetail(item: { id: number }) {
  openDetail(item.id)
}

function openCreateForm() {
  router.push({ name: ROUTE.REJECTION_REASON_NEW })
}

function openEditForm(item: { id: number }) {
  router.push({ name: ROUTE.REJECTION_REASON_EDIT, params: { id: String(item.id) } })
}

const {
  setDialogRef: setToggleDialogRef,
  record: toggleRecord,
  isPending: isToggling,
  ask: askToggleActive,
  confirm: confirmToggleActive,
} = useToggleActive<ToggleRecord>({
  resource: 'requestRejectionReasons',
  toggle: (record) => toggleRequestRejectionReasonActiveAction(record.id),
  messages: messages.requestRejectionReason,
  closeDetail,
})
</script>

<template>
  <div class="mb-6">
    <h1 class="text-h5 font-weight-bold">Lista de motivos de rechazo</h1>
    <p class="text-body-2 text-medium-emphasis mt-1">
      Mantenedor de motivos disponibles al rechazar una solicitud.
    </p>
  </div>

  <ListControls
    v-model:search="searchInput"
    search-placeholder="Buscar por nombre"
    new-label="Nuevo"
    :show-export="false"
    :show-new="canCreate"
    @filter="filtersOpen = true"
    @new="openCreateForm"
  />

  <ActiveFilters
    :filters="activeFilters"
    @remove-filter="clearFilter"
    @clear-all="clearAllFilters"
  />

  <v-alert v-if="isError" type="error" variant="tonal" density="compact" class="mb-4 text-caption">
    No se pudo cargar la lista de motivos de rechazo.
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
    <template #item.name="{ item }">
      <span class="link-cell" @click="viewDetail(item)">{{ item.name }}</span>
    </template>

    <template #item.subModule="{ item }">
      {{ subModuleName(item.subModule) }}
    </template>

    <template #item.active="{ item }">
      <v-chip size="small" variant="tonal" :color="item.status.color">
        {{ item.status.label }}
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <ActionsMenu
        :record="item"
        @view="viewDetail(item)"
        @edit="openEditForm(item)"
        @toggle="askToggleActive(item)"
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

  <RequestRejectionReasonDetailDrawer
    v-model:open="detailDrawerOpen"
    :request-rejection-reason="selectedRequestRejectionReason ?? null"
    :loading="detailLoading"
    @edit="openEditForm"
    @toggle-active="askToggleActive"
  />

  <ConfirmStatusDialog
    :ref="setToggleDialogRef"
    :record="toggleRecord"
    :loading="isToggling"
    entity="motivo de rechazo"
    @confirm="confirmToggleActive"
  />
</template>

<style scoped>
:deep(.v-data-table-header__sort-icon) {
  font-size: 1.125rem;
}
</style>
