<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { mdiEyeOutline, mdiPencilOutline } from '@mdi/js'
import {
  getCostCenterOptionsAction,
  getRoleOptionsAction,
  getUserDetailAction,
  getUserListAction,
  toggleUserActiveAction,
} from '@/actions'
import { useMessage } from '@/composables/useMessage'
import { usePermissions } from '@/composables/usePermissions'
import { ACTION } from '@/constants/actions.constants'
import { ROUTE } from '@/router/route-names'
import messages from '@/messages'
import {
  parseUserQuery,
  userQueryToRoute,
  type UserListItem,
  type UserQueryParams,
  type UserSort,
} from '@/models'
import ListControls from '@/components/common/ListControls.vue'
import ActiveFilters from '@/components/common/ActiveFilters.vue'
import FiltersDrawer, { type FilterField } from '@/components/common/FiltersDrawer.vue'
import UserDetailDrawer from '@/components/detail/UserDetailDrawer.vue'
import ConfirmStatusDialog from '@/components/common/ConfirmStatusDialog.vue'
import ListFooter from '@/components/common/ListFooter.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'
import AlertComponent from '@/components/common/AlertComponent.vue'

const { smAndDown } = useDisplay()
const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const { toastToggled, toastFailed } = useMessage()
const { hasPermission } = usePermissions()
const canCreate = computed(() => hasPermission('create'))
const canUpdate = computed(() => hasPermission('update'))
const canToggleActive = computed(() => hasPermission('active'))

const query = computed<UserQueryParams>(() => parseUserQuery(route.query))

// Encadena patches del mismo tick sobre el último estado pedido, no sobre la ruta aún sin propagar.
let pendingQuery: UserQueryParams | null = null

function patchQuery(patch: Partial<UserQueryParams>) {
  const next: UserQueryParams = { ...(pendingQuery ?? query.value), ...patch }
  if (!('page' in patch)) next.page = 1
  pendingQuery = next
  void router.replace({ query: { ...userQueryToRoute(next), ...detailQueryParam.value } }).finally(() => {
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

const activeFilters = computed(() => {
  const active: { key: string; label: string }[] = []
  const roleName = roleOptions.value?.find((o) => o.id === query.value.roleId)?.name
  if (roleName) active.push({ key: 'roleId', label: `Rol: ${roleName}` })
  if (query.value.active !== null) {
    active.push({ key: 'active', label: `Estado: ${query.value.active ? 'Activos' : 'Inactivos'}` })
  }
  return active
})

function clearFilter(key: string) {
  patchQuery({ [key]: null })
}

function clearAllFilters() {
  patchQuery({ roleId: null, active: null })
}

const sort = computed<UserSort>(() => query.value.sort)
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

const listQueryKey = computed(() => ['users', { ...query.value }])

const { data: listResult, isPending, isError } = useQuery({
  queryKey: listQueryKey,
  queryFn: () => getUserListAction({ ...query.value }),
  placeholderData: keepPreviousData,
})

const items = computed<UserListItem[]>(() => listResult.value?.data ?? [])
const totalItems = computed(() => listResult.value?.meta.total ?? 0)
const pageCount = computed(() => listResult.value?.meta.pageCount ?? 1)

watch(pageCount, (count) => {
  if (count >= 1 && query.value.page > count) patchQuery({ page: count })
})

const headers = [
  { title: 'Nombre', key: 'firstName', sortable: true },
  { title: 'Correo', key: 'email', sortable: true },
  { title: 'Rol', key: 'role', sortable: false },
  { title: 'Estado', key: 'active', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]

const { data: selectedUser, isPending: detailLoading } = useQuery({
  queryKey: computed(() => ['users', 'detail', detailId.value]),
  queryFn: () => getUserDetailAction(detailId.value as number),
  enabled: computed(() => detailId.value !== null),
})

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

const statusDialogRef = ref<InstanceType<typeof ConfirmStatusDialog> | null>(null)
const statusRecord = ref<{ id: number; name: string; active: boolean } | null>(null)

function askToggleActive(item: { id: number; fullName: string; active: boolean }) {
  statusRecord.value = { id: item.id, name: item.fullName, active: item.active }
  statusDialogRef.value?.open()
}

const toggleMutation = useMutation({
  mutationFn: (id: number) => toggleUserActiveAction(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
    closeDetail()
    statusDialogRef.value?.close()
    if (statusRecord.value) toastToggled(statusRecord.value.active, messages.user)
  },
  onError: () => {
    toastFailed(messages.user)
  },
})

function confirmToggleActive() {
  if (statusRecord.value) toggleMutation.mutate(statusRecord.value.id)
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
    v-if="!smAndDown"
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
        :has-update-permission="canUpdate"
        :has-active-permission="canToggleActive"
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

  <template v-else>
    <v-card flat border>
      <template v-for="(item, index) in items" :key="item.id">
        <div class="pa-4" :class="{ 'user-block--divided': index > 0 }">
          <div class="d-flex flex-wrap align-center justify-space-between ga-2">
            <span class="link-cell text-subtitle-2 font-weight-bold" @click="viewDetail(item)">{{
              item.fullName
            }}</span>
            <v-chip size="small" variant="tonal" :color="item.status.color">
              {{ item.status.label }}
            </v-chip>
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            {{ item.email }} · {{ item.role.name }}
          </div>

          <div class="d-flex flex-wrap ga-2 mt-3">
            <v-btn size="small" variant="tonal" :prepend-icon="mdiEyeOutline" @click="viewDetail(item)">
              Ver detalle
            </v-btn>
            <v-btn
              v-if="canUpdate && item.actions.includes(ACTION.UPDATE)"
              size="small"
              variant="text"
              :prepend-icon="mdiPencilOutline"
              @click="openEditForm(item)"
            >
              Editar
            </v-btn>
          </div>
        </div>
      </template>

      <AlertComponent
        v-if="!items.length && !isError"
        type="info"
        message="No hay resultados para tu búsqueda."
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

  <UserDetailDrawer
    v-model:open="detailDrawerOpen"
    :user="selectedUser ?? null"
    :cost-centers="selectedCostCenters"
    :loading="detailLoading"
    :has-update-permission="canUpdate"
    :has-active-permission="canToggleActive"
    @edit="openEditForm"
    @toggle-active="askToggleActive"
  />

  <ConfirmStatusDialog
    ref="statusDialogRef"
    :record="statusRecord"
    :loading="toggleMutation.isPending.value"
    entity="usuario"
    @confirm="confirmToggleActive"
  />
</template>

<style scoped>
.user-block--divided {
  border-top: thin solid rgba(var(--v-theme-on-surface), 0.12);
}

:deep(.v-data-table-header__sort-icon) {
  font-size: 1.125rem;
}
</style>
