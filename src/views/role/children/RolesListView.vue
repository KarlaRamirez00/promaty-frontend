<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { mdiAccountGroupOutline, mdiSwapHorizontal } from '@mdi/js'
import {
  getRoleDetailAction,
  getRoleListAction,
  getPermissionOptionsAction,
  getRoleOptionsAction,
  toggleRoleActiveAction,
} from '@/actions'
import { useActiveFilters } from '@/composables/useActiveFilters'
import { useDetailSlide } from '@/composables/useDetailSlide'
import { useListQuery } from '@/composables/useListQuery'
import { usePermissions } from '@/composables/usePermissions'
import { useToggleActive, type ToggleRecord } from '@/composables/useToggleActive'
import { ROUTE } from '@/router/route-names'
import messages from '@/messages'
import {
  parseRoleQuery,
  roleQueryToRoute,
  type RoleListItem,
  type RoleQueryParams,
} from '@/models'
import ListControls from '@/components/common/ListControls.vue'
import ActiveFilters from '@/components/common/ActiveFilters.vue'
import FiltersDrawer, { type FilterField } from '@/components/common/FiltersDrawer.vue'
import RoleDetailDrawer from '@/components/detail/RoleDetailDrawer.vue'
import ListFooter from '@/components/common/ListFooter.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'
import ConfirmStatusDialog from '@/components/common/ConfirmStatusDialog.vue'

const router = useRouter()
const { hasPermission } = usePermissions()
const canCreate = computed(() => hasPermission('create'))

const {
  detailQueryParam,
  isOpen: detailDrawerOpen,
  open: openDetail,
  close: closeDetail,
  record: selectedRole,
  isLoading: detailLoading,
} = useDetailSlide('roles', getRoleDetailAction)

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
} = useListQuery<RoleQueryParams, RoleListItem>({
  resource: 'roles',
  parse: parseRoleQuery,
  toRoute: roleQueryToRoute,
  fetch: getRoleListAction,
  extraRouteQuery: () => detailQueryParam.value,
})

const filtersOpen = ref(false)

const { data: permissionOptions } = useQuery({
  queryKey: ['permissions', 'options'],
  queryFn: getPermissionOptionsAction,
})

const subModuleOptions = computed(() => {
  const seen = new Map<number, string>()
  for (const permission of permissionOptions.value ?? []) {
    seen.set(permission.subModule.id, permission.subModule.alias || permission.subModule.name)
  }
  return [...seen].map(([value, title]) => ({ title, value }))
})

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
  { key: 'subModuleId', type: 'select', label: 'Submódulo', options: subModuleOptions.value },
])

const filterValues = computed<Record<string, unknown>>({
  get: () => ({ active: query.value.active, subModuleId: query.value.subModuleId }),
  set: (value) => {
    patchQuery({
      active: (value.active as boolean | null) ?? null,
      subModuleId: (value.subModuleId as number | null) ?? null,
    })
  },
})

const { activeFilters, clearFilter, clearAllFilters } = useActiveFilters<RoleQueryParams>({
  patchQuery,
  resetAll: { active: null, subModuleId: null },
  chips: () => {
    const chips = []
    if (query.value.active !== null) {
      chips.push({ key: 'active', label: `Estado: ${query.value.active ? 'Activos' : 'Inactivos'}` })
    }
    const subModuleName = subModuleOptions.value.find((o) => o.value === query.value.subModuleId)?.title
    if (subModuleName) chips.push({ key: 'subModuleId', label: `Submódulo: ${subModuleName}` })
    return chips
  },
})

const headers = [
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Usuarios', key: 'totalUsers', sortable: true },
  { title: 'Estado', key: 'active', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]

function viewDetail(item: { id: number }) {
  openDetail(item.id)
}

function openCreateForm() {
  router.push({ name: ROUTE.ROLE_NEW })
}

function openEditForm(item: { id: number }) {
  router.push({ name: ROUTE.ROLE_EDIT, params: { id: String(item.id) } })
}

// Desactivar un rol con usuarios asignados exige un rol de reemplazo (backend lo valida server-side,
// ver RoleServiceImpl.toggleRoleActive) — el diálogo pide ese selector solo cuando aplica.
interface RoleToggleRecord extends ToggleRecord {
  totalUsers: number
}

const replacementRoleId = ref<number | null>(null)

const {
  setDialogRef: setToggleDialogRef,
  record: toggleRecord,
  isPending: isToggling,
  ask,
  confirm: confirmToggleActive,
} = useToggleActive<RoleToggleRecord>({
  resource: 'roles',
  toggle: (record) => toggleRoleActiveAction(record.id, replacementRoleId.value),
  messages: messages.role,
  closeDetail,
})

const needsReplacement = computed(
  () => !!toggleRecord.value?.active && (toggleRecord.value?.totalUsers ?? 0) > 0,
)

const { data: replacementOptions } = useQuery({
  queryKey: computed(() => ['roles', 'options', toggleRecord.value?.id]),
  queryFn: () => getRoleOptionsAction(toggleRecord.value?.id),
  enabled: needsReplacement,
})

function askToggleActive(item: RoleToggleRecord) {
  replacementRoleId.value = null
  ask(item)
}

const canConfirmToggle = computed(() => !needsReplacement.value || replacementRoleId.value !== null)
</script>

<template>
  <div class="mb-6">
    <h1 class="text-h5 font-weight-bold">Lista de roles</h1>
    <p class="text-body-2 text-medium-emphasis mt-1">
      Roles y permisos disponibles para los usuarios del sistema.
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
    No se pudo cargar la lista de roles.
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

  <RoleDetailDrawer
    v-model:open="detailDrawerOpen"
    :role="selectedRole ?? null"
    :permission-catalog="permissionOptions ?? []"
    :loading="detailLoading"
    @edit="openEditForm"
    @toggle-active="askToggleActive"
  />

  <ConfirmStatusDialog
    :ref="setToggleDialogRef"
    :record="toggleRecord"
    :loading="isToggling"
    :confirm-disabled="!canConfirmToggle"
    entity="rol"
    @confirm="confirmToggleActive"
  >
    <template #details>
      <div class="d-flex align-center justify-space-between">
        <span class="d-flex align-center ga-2 text-body-2">
          <v-icon :icon="mdiAccountGroupOutline" color="info" size="20" />
          Usuarios asignados
        </span>
        <v-chip size="small" variant="outlined" label>{{ toggleRecord?.totalUsers }}</v-chip>
      </div>
    </template>

    <template v-if="needsReplacement" #extra>
      <v-sheet border rounded class="border-info px-4 py-3 mt-4">
        <div class="d-flex align-center ga-2 text-body-2 mb-3">
          <v-icon :icon="mdiSwapHorizontal" color="info" size="20" />
          <span>Selecciona un <strong>nuevo rol</strong> para estos usuarios</span>
        </div>
        <v-select
          v-model="replacementRoleId"
          :items="replacementOptions ?? []"
          item-title="name"
          item-value="id"
          placeholder="Seleccionar rol"
          variant="outlined"
          density="comfortable"
          hide-details
        />
      </v-sheet>
    </template>
  </ConfirmStatusDialog>
</template>

<style scoped>
:deep(.v-data-table-header__sort-icon) {
  font-size: 1.125rem;
}
</style>
