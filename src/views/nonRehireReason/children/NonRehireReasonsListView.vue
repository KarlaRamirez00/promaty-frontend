<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  getNonRehireReasonDetailAction,
  getNonRehireReasonListAction,
  toggleNonRehireReasonActiveAction,
} from '@/actions'
import { useActiveFilters } from '@/composables/useActiveFilters'
import { useDetailSlide } from '@/composables/useDetailSlide'
import { useListQuery } from '@/composables/useListQuery'
import { usePermissions } from '@/composables/usePermissions'
import { useToggleActive, type ToggleRecord } from '@/composables/useToggleActive'
import { ROUTE } from '@/router/route-names'
import messages from '@/messages'
import {
  nonRehireReasonQueryToRoute,
  parseNonRehireReasonQuery,
  type NonRehireReasonListItem,
  type NonRehireReasonQueryParams,
} from '@/models'
import ListControls from '@/components/common/ListControls.vue'
import ActiveFilters from '@/components/common/ActiveFilters.vue'
import FiltersDrawer, { type FilterField } from '@/components/common/FiltersDrawer.vue'
import NonRehireReasonDetailDrawer from '@/components/detail/NonRehireReasonDetailDrawer.vue'
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
  record: selectedNonRehireReason,
  isLoading: detailLoading,
} = useDetailSlide('nonRehireReasons', getNonRehireReasonDetailAction)

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
} = useListQuery<NonRehireReasonQueryParams, NonRehireReasonListItem>({
  resource: 'nonRehireReasons',
  parse: parseNonRehireReasonQuery,
  toRoute: nonRehireReasonQueryToRoute,
  fetch: getNonRehireReasonListAction,
  extraRouteQuery: () => detailQueryParam.value,
})

const filtersOpen = ref(false)

const filterFields: FilterField[] = [
  {
    key: 'active',
    type: 'select',
    label: 'Estado',
    options: [
      { title: 'Activos', value: true },
      { title: 'Inactivos', value: false },
    ],
  },
]

const filterValues = computed<Record<string, unknown>>({
  get: () => ({ active: query.value.active }),
  set: (value) => {
    patchQuery({ active: (value.active as boolean | null) ?? null })
  },
})

const { activeFilters, clearFilter, clearAllFilters } = useActiveFilters<NonRehireReasonQueryParams>({
  patchQuery,
  resetAll: { active: null },
  chips: () => {
    const chips = []
    if (query.value.active !== null) {
      chips.push({ key: 'active', label: `Estado: ${query.value.active ? 'Activos' : 'Inactivos'}` })
    }
    return chips
  },
})

const headers = [
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Actualización', key: 'updatedAt', sortable: true },
  { title: 'Estado', key: 'active', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]

function viewDetail(item: { id: number }) {
  openDetail(item.id)
}

function openCreateForm() {
  router.push({ name: ROUTE.NON_REHIRE_REASON_NEW })
}

function openEditForm(item: { id: number }) {
  router.push({ name: ROUTE.NON_REHIRE_REASON_EDIT, params: { id: String(item.id) } })
}

const {
  setDialogRef: setToggleDialogRef,
  record: toggleRecord,
  isPending: isToggling,
  ask: askToggleActive,
  confirm: confirmToggleActive,
} = useToggleActive<ToggleRecord>({
  resource: 'nonRehireReasons',
  toggle: (record) => toggleNonRehireReasonActiveAction(record.id),
  messages: messages.nonRehireReason,
  closeDetail,
})
</script>

<template>
  <div class="mb-6">
    <h1 class="text-h5 font-weight-bold">Lista de motivos de no recontratación</h1>
    <p class="text-body-2 text-medium-emphasis mt-1">
      Mantenedor de motivos disponibles al registrar un finiquito definitivo.
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
    No se pudo cargar la lista de motivos de no recontratación.
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

  <NonRehireReasonDetailDrawer
    v-model:open="detailDrawerOpen"
    :non-rehire-reason="selectedNonRehireReason ?? null"
    :loading="detailLoading"
    @edit="openEditForm"
    @toggle-active="askToggleActive"
  />

  <ConfirmStatusDialog
    :ref="setToggleDialogRef"
    :record="toggleRecord"
    :loading="isToggling"
    entity="motivo de no recontratación"
    @confirm="confirmToggleActive"
  />
</template>

<style scoped>
:deep(.v-data-table-header__sort-icon) {
  font-size: 1.125rem;
}
</style>
