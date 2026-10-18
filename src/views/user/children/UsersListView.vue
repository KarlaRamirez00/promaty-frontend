<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import {
  getCostCenterOptionsAction,
  getRoleOptionsAction,
  getUserDetailAction,
  getUserListAction,
  toggleUserActiveAction,
} from '@/actions'
import { useActiveFilters } from '@/composables/useActiveFilters'
import { useDetailSlide } from '@/composables/useDetailSlide'
import { useListQuery } from '@/composables/useListQuery'
import { usePermissions } from '@/composables/usePermissions'
import { useToggleActive, type ToggleRecord } from '@/composables/useToggleActive'
import { ROUTE } from '@/router/route-names'
import messages from '@/messages'
import {
  parseUserQuery,
  userQueryToRoute,
  type UserListItem,
  type UserQueryParams,
} from '@/models'
import ListControls from '@/components/common/ListControls.vue'
import ActiveFilters from '@/components/common/ActiveFilters.vue'
import FiltersDrawer, { type FilterField } from '@/components/common/FiltersDrawer.vue'
import UserDetailDrawer from '@/components/detail/UserDetailDrawer.vue'
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
  record: selectedUser,
  isLoading: detailLoading,
} = useDetailSlide('users', getUserDetailAction)

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
} = useListQuery<UserQueryParams, UserListItem>({
  resource: 'users',
  parse: parseUserQuery,
  toRoute: userQueryToRoute,
  fetch: getUserListAction,
  extraRouteQuery: () => detailQueryParam.value,
})

const filtersOpen = ref(false)

const { data: roleOptions } = useQuery({
  queryKey: ['roles', 'options'],
  queryFn: () => getRoleOptionsAction(),
})

const filterFields = computed<FilterField[]>(() => [
  {
    key: 'roleId',
    type: 'select',
    label: 'Rol',
    options: (roleOptions.value ?? []).map((o) => ({ title: o.name, value: o.id })),
  },
  {
    key: 'active',
    type: 'select',
    label: 'Estado',
    options: [
      { title: 'Activos', value: true },
      { title: 'Inactivos', value: false },
    ],
  },
])

const filterValues = computed<Record<string, unknown>>({
  get: () => ({ roleId: query.value.roleId, active: query.value.active }),
  set: (value) => {
    patchQuery({
      roleId: (value.roleId as number | null) ?? null,
      active: (value.active as boolean | null) ?? null,
    })
  },
})

const { activeFilters, clearFilter, clearAllFilters } = useActiveFilters<UserQueryParams>({
  patchQuery,
  resetAll: { roleId: null, active: null },
  chips: () => {
    const chips = []
    const roleName = roleOptions.value?.find((o) => o.id === query.value.roleId)?.name
    if (roleName) chips.push({ key: 'roleId', label: `Rol: ${roleName}` })
    if (query.value.active !== null) {
      chips.push({ key: 'active', label: `Estado: ${query.value.active ? 'Activos' : 'Inactivos'}` })
    }
    return chips
  },
})

const headers = [
  { title: 'Nombre', key: 'firstName', sortable: true },
  { title: 'Correo', key: 'email', sortable: true },
  { title: 'Rol', key: 'role', sortable: false },
  { title: 'Estado', key: 'active', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]

const { data: costCenterOptions } = useQuery({
  queryKey: ['projects', 'options', 'costCenters'],
  queryFn: getCostCenterOptionsAction,
  enabled: detailDrawerOpen,
})

const selectedCostCenters = computed(() => {
  const ids = new Set(selectedUser.value?.projectIds ?? [])
  return (costCenterOptions.value ?? []).filter((option) => ids.has(option.id)).map((option) => option.title)
})

function viewDetail(item: { id: number }) {
  openDetail(item.id)
}

function openCreateForm() {
  router.push({ name: ROUTE.USER_NEW })
}

function openEditForm(item: { id: number }) {
  router.push({ name: ROUTE.USER_EDIT, params: { id: String(item.id) } })
}

const {
  setDialogRef: setToggleDialogRef,
  record: toggleRecord,
  isPending: isToggling,
  ask,
  confirm: confirmToggleActive,
} = useToggleActive<ToggleRecord>({
  resource: 'users',
  toggle: (record) => toggleUserActiveAction(record.id),
  messages: messages.user,
  closeDetail,
})

function askToggleActive(item: { id: number; fullName: string; active: boolean }) {
  ask({ id: item.id, name: item.fullName, active: item.active })
}
</script>

<template>
  <div class="mb-6">
    <h1 class="text-h5 font-weight-bold">Lista de usuarios</h1>
    <p class="text-body-2 text-medium-emphasis mt-1">
      Usuarios con acceso al sistema y su rol asignado.
    </p>
  </div>

  <ListControls
    v-model:search="searchInput"
    search-placeholder="Buscar por nombre o correo"
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
    No se pudo cargar la lista de usuarios.
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

    <template #item.role="{ item }">
      {{ item.role.name }}
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

  <UserDetailDrawer
    v-model:open="detailDrawerOpen"
    :user="selectedUser ?? null"
    :cost-centers="selectedCostCenters"
    :loading="detailLoading"
    @edit="openEditForm"
    @toggle-active="askToggleActive"
  />

  <ConfirmStatusDialog
    :ref="setToggleDialogRef"
    :record="toggleRecord"
    :loading="isToggling"
    entity="usuario"
    @confirm="confirmToggleActive"
  />
</template>

<style scoped>
:deep(.v-data-table-header__sort-icon) {
  font-size: 1.125rem;
}
</style>
