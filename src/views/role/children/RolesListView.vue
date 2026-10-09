<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { mdiAccountGroupOutline, mdiEyeOutline, mdiPencilOutline, mdiSwapHorizontal } from '@mdi/js'
import {
  getRoleDetailAction,
  getRoleListAction,
  getPermissionOptionsAction,
  getRoleOptionsAction,
  toggleRoleActiveAction,
} from '@/actions'
import { useMessage } from '@/composables/useMessage'
import { usePermissions } from '@/composables/usePermissions'
import { ACTION } from '@/constants/actions.constants'
import { ROUTE } from '@/router/route-names'
import messages from '@/messages'
import {
  parseRoleQuery,
  roleQueryToRoute,
  type RoleListItem,
  type RoleQueryParams,
  type RoleSort,
} from '@/models'
import ListControls from '@/components/common/ListControls.vue'
import ActiveFilters from '@/components/common/ActiveFilters.vue'
import FiltersDrawer, { type FilterField } from '@/components/common/FiltersDrawer.vue'
import RoleDetailDrawer from '@/components/detail/RoleDetailDrawer.vue'
import ListFooter from '@/components/common/ListFooter.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'
import ConfirmStatusDialog from '@/components/common/ConfirmStatusDialog.vue'
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

const query = computed<RoleQueryParams>(() => parseRoleQuery(route.query))

// Encadena patches del mismo tick sobre el último estado pedido, no sobre la ruta aún sin propagar.
let pendingQuery: RoleQueryParams | null = null

function patchQuery(patch: Partial<RoleQueryParams>) {
  const next: RoleQueryParams = { ...(pendingQuery ?? query.value), ...patch }
  if (!('page' in patch)) next.page = 1
  pendingQuery = next
  void router.replace({ query: { ...roleQueryToRoute(next), ...detailQueryParam.value } }).finally(() => {
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

const activeFilters = computed(() => {
  const active: { key: string; label: string }[] = []
  if (query.value.active !== null) {
    active.push({ key: 'active', label: `Estado: ${query.value.active ? 'Activos' : 'Inactivos'}` })
  }
  const subModuleName = subModuleOptions.value.find((o) => o.value === query.value.subModuleId)?.title
  if (subModuleName) active.push({ key: 'subModuleId', label: `Submódulo: ${subModuleName}` })
  return active
})

function clearFilter(key: string) {
  patchQuery({ [key]: null })
}

function clearAllFilters() {
  patchQuery({ active: null, subModuleId: null })
}

const sort = computed<RoleSort>(() => query.value.sort)
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

const listQueryKey = computed(() => ['roles', { ...query.value }])

const { data: listResult, isPending, isError } = useQuery({
  queryKey: listQueryKey,
  queryFn: () => getRoleListAction({ ...query.value }),
  placeholderData: keepPreviousData,
})

const items = computed<RoleListItem[]>(() => listResult.value?.data ?? [])
const totalItems = computed(() => listResult.value?.meta.total ?? 0)
const pageCount = computed(() => listResult.value?.meta.pageCount ?? 1)

watch(pageCount, (count) => {
  if (count >= 1 && query.value.page > count) patchQuery({ page: count })
})

const headers = [
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Usuarios', key: 'totalUsers', sortable: true },
  { title: 'Estado', key: 'active', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]

const { data: selectedRole, isPending: detailLoading } = useQuery({
  queryKey: computed(() => ['roles', 'detail', detailId.value]),
  queryFn: () => getRoleDetailAction(detailId.value as number),
  enabled: computed(() => detailId.value !== null),
})

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
const statusDialogRef = ref<InstanceType<typeof ConfirmStatusDialog> | null>(null)
const statusRecord = ref<{ id: number; name: string; active: boolean; totalUsers: number } | null>(null)
const replacementRoleId = ref<number | null>(null)

const needsReplacement = computed(
  () => !!statusRecord.value?.active && (statusRecord.value?.totalUsers ?? 0) > 0,
)

const { data: replacementOptions } = useQuery({
  queryKey: computed(() => ['roles', 'options', statusRecord.value?.id]),
  queryFn: () => getRoleOptionsAction(statusRecord.value?.id),
  enabled: needsReplacement,
})

function askToggleActive(item: { id: number; name: string; active: boolean; totalUsers: number }) {
  statusRecord.value = item
  replacementRoleId.value = null
  statusDialogRef.value?.open()
}

const toggleMutation = useMutation({
  mutationFn: () => toggleRoleActiveAction(statusRecord.value?.id as number, replacementRoleId.value),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['roles'] })
    closeDetail()
    statusDialogRef.value?.close()
    if (statusRecord.value) toastToggled(statusRecord.value.active, messages.role)
  },
  onError: () => {
    toastFailed(messages.role)
  },
})

function confirmToggleActive() {
  if (statusRecord.value) toggleMutation.mutate()
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
        <div class="pa-4" :class="{ 'role-block--divided': index > 0 }">
          <div class="d-flex flex-wrap align-center justify-space-between ga-2">
            <span class="link-cell text-subtitle-2 font-weight-bold" @click="viewDetail(item)">{{
              item.name
            }}</span>
            <v-chip size="small" variant="tonal" :color="item.status.color">
              {{ item.status.label }}
            </v-chip>
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            {{ item.totalUsers }} usuario(s) asignado(s)
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

  <RoleDetailDrawer
    v-model:open="detailDrawerOpen"
    :role="selectedRole ?? null"
    :permission-catalog="permissionOptions ?? []"
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
        <v-chip size="small" variant="outlined" label>{{ statusRecord?.totalUsers }}</v-chip>
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
.role-block--divided {
  border-top: thin solid rgba(var(--v-theme-on-surface), 0.12);
}

:deep(.v-data-table-header__sort-icon) {
  font-size: 1.125rem;
}
</style>
