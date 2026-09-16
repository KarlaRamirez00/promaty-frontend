<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { mdiChevronRight, mdiContentSave, mdiEyeOutline, mdiPencilOutline } from '@mdi/js'
import {
  getClientOptionsAction,
  getProjectDetailAction,
  getProjectListAction,
  getProjectSpecialtyOptionsAction,
  getProjectStatusOptionsAction,
  getProjectTypeOptionsAction,
  updateProjectStatusAction,
} from '@/actions'
import { usePermissions } from '@/composables/usePermissions'
import { useMessage } from '@/composables/useMessage'
import { useSnackbarStore } from '@/stores'
import { ACTION } from '@/constants/actions.constants'
import messages from '@/messages'
import { ROUTE } from '@/router/route-names'
import {
  parseProjectQuery,
  projectQueryToRoute,
  type ProjectListItem,
  type ProjectQueryParams,
  type ProjectSort,
} from '@/models'
import ListControls from '@/components/common/ListControls.vue'
import ActiveFilters from '@/components/common/ActiveFilters.vue'
import FiltersDrawer, { type FilterField } from '@/components/common/FiltersDrawer.vue'
import ProjectDetailDrawer from '@/components/detail/ProjectDetailDrawer.vue'
import ListFooter from '@/components/common/ListFooter.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'
import AlertComponent from '@/components/common/AlertComponent.vue'

const { smAndDown } = useDisplay()
const route = useRoute()
const router = useRouter()
const { hasPermission } = usePermissions()
const canCreate = computed(() => hasPermission('create'))
const canUpdate = computed(() => hasPermission('update'))
const canChangeStatus = computed(() => hasPermission('status'))

const query = computed<ProjectQueryParams>(() => parseProjectQuery(route.query))

// Encadena patches del mismo tick sobre el último estado pedido, no sobre la ruta aún sin propagar.
let pendingQuery: ProjectQueryParams | null = null

function patchQuery(patch: Partial<ProjectQueryParams>) {
  const next: ProjectQueryParams = { ...(pendingQuery ?? query.value), ...patch }
  if (!('page' in patch)) next.page = 1
  pendingQuery = next
  void router.replace({ query: { ...projectQueryToRoute(next), ...detailQueryParam.value } }).finally(() => {
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

const { data: typeOptions } = useQuery({
  queryKey: ['projectTypes', 'options'],
  queryFn: getProjectTypeOptionsAction,
})
const { data: specialtyOptions } = useQuery({
  queryKey: ['projectSpecialties', 'options'],
  queryFn: getProjectSpecialtyOptionsAction,
})
const { data: clientOptions } = useQuery({
  queryKey: ['clients', 'options'],
  queryFn: getClientOptionsAction,
})
const { data: statusOptions } = useQuery({
  queryKey: ['projectStatuses', 'options'],
  queryFn: getProjectStatusOptionsAction,
})

const filterFields = computed<FilterField[]>(() => [
  {
    key: 'typeId',
    type: 'select',
    label: 'Tipo de proyecto',
    options: (typeOptions.value ?? []).map((o) => ({ title: o.name, value: o.id })),
  },
  {
    key: 'specialtyId',
    type: 'select',
    label: 'Especialidad',
    options: (specialtyOptions.value ?? []).map((o) => ({ title: o.name, value: o.id })),
  },
  {
    key: 'clientId',
    type: 'select',
    label: 'Mandante',
    options: (clientOptions.value ?? []).map((o) => ({ title: o.name, value: o.id })),
  },
  {
    key: 'statusId',
    type: 'select',
    label: 'Estado',
    options: (statusOptions.value ?? []).map((o) => ({ title: o.name, value: o.id })),
  },
])

const filterValues = computed<Record<string, unknown>>({
  get: () => ({
    typeId: query.value.typeId,
    specialtyId: query.value.specialtyId,
    clientId: query.value.clientId,
    statusId: query.value.statusId,
  }),
  set: (value) => {
    patchQuery({
      typeId: (value.typeId as number | null) ?? null,
      specialtyId: (value.specialtyId as number | null) ?? null,
      clientId: (value.clientId as number | null) ?? null,
      statusId: (value.statusId as number | null) ?? null,
    })
  },
})

const activeFilters = computed(() => {
  const active: { key: string; label: string }[] = []
  const typeName = typeOptions.value?.find((o) => o.id === query.value.typeId)?.name
  const specialtyName = specialtyOptions.value?.find((o) => o.id === query.value.specialtyId)?.name
  const clientName = clientOptions.value?.find((o) => o.id === query.value.clientId)?.name
  const statusName = statusOptions.value?.find((o) => o.id === query.value.statusId)?.name
  if (typeName) active.push({ key: 'typeId', label: `Tipo: ${typeName}` })
  if (specialtyName) active.push({ key: 'specialtyId', label: `Especialidad: ${specialtyName}` })
  if (clientName) active.push({ key: 'clientId', label: `Mandante: ${clientName}` })
  if (statusName) active.push({ key: 'statusId', label: `Estado: ${statusName}` })
  return active
})

function clearFilter(key: string) {
  patchQuery({ [key]: null })
}

function clearAllFilters() {
  patchQuery({ typeId: null, specialtyId: null, clientId: null, statusId: null })
}

const sort = computed<ProjectSort>(() => query.value.sort)
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

const listQueryKey = computed(() => ['projects', { ...query.value }])

const { data: listResult, isPending, isError } = useQuery({
  queryKey: listQueryKey,
  queryFn: () => getProjectListAction({ ...query.value }),
  placeholderData: keepPreviousData,
})

const items = computed<ProjectListItem[]>(() => listResult.value?.data ?? [])
const totalItems = computed(() => listResult.value?.meta.total ?? 0)
const pageCount = computed(() => listResult.value?.meta.pageCount ?? 1)

watch(pageCount, (count) => {
  if (count >= 1 && query.value.page > count) patchQuery({ page: count })
})

const headers = [
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Centro de costo', key: 'costCenterCode', sortable: false },
  { title: 'Tipo', key: 'typeName', sortable: false },
  { title: 'Mandante', key: 'clientName', sortable: false },
  { title: 'Estado', key: 'statusName', sortable: false },
  { title: 'Inicio', key: 'startDate', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]

const { data: selectedProject, isPending: detailLoading } = useQuery({
  queryKey: computed(() => ['projects', 'detail', detailId.value]),
  queryFn: () => getProjectDetailAction(detailId.value as number),
  enabled: computed(() => detailId.value !== null),
})

const queryClient = useQueryClient()
const { toastFailed } = useMessage()
const snackbar = useSnackbarStore()

// Selector aislado del estado del proyecto: PATCH /projects/{id}/status, separado del PUT general
// (backend confirmó despliegue el 2026-09-13, ver MR-B08). Reutiliza statusOptions ya cargado para
// el filtro de arriba.
const selectedStatusId = ref<number | null>(null)

watch(selectedProject, (project) => {
  selectedStatusId.value = project?.status.id ?? null
})

const canSaveStatus = computed(
  () => selectedStatusId.value !== null && selectedStatusId.value !== selectedProject.value?.status.id,
)

const updateStatusMutation = useMutation({
  mutationFn: () => updateProjectStatusAction(detailId.value as number, selectedStatusId.value as number),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] })
    queryClient.invalidateQueries({ queryKey: ['projects', 'detail', detailId.value] })
    snackbar.success(messages.project.toastStatusUpdated)
  },
  onError: () => {
    toastFailed(messages.project)
  },
})

function viewDetail(item: { id: number }) {
  openDetail(item.id)
}

function openCreateForm() {
  router.push({ name: ROUTE.PROJECT_NEW })
}

function openEditForm(item: { id: number }) {
  router.push({ name: ROUTE.PROJECT_EDIT, params: { id: String(item.id) } })
}
</script>

<template>
  <div class="mb-6">
    <h1 class="text-h4 font-weight-bold">Proyectos</h1>
    <p class="text-body-2 text-medium-emphasis mt-1">
      Mantenedor de proyectos asociados a mandantes, tipos y especialidades.
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

  <ActiveFilters :filters="activeFilters" @remove-filter="clearFilter" @clear-all="clearAllFilters" />

  <v-alert v-if="isError" type="error" variant="tonal" density="compact" class="mb-4">
    No se pudo cargar la lista de proyectos.
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

    <template #item.actions="{ item }">
      <ActionsMenu
        :record="item"
        :has-update-permission="canUpdate"
        @view="viewDetail(item)"
        @edit="openEditForm(item)"
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
        <div class="pa-4" :class="{ 'project-block--divided': index > 0 }">
          <div class="d-flex flex-wrap align-center justify-space-between ga-2">
            <span class="link-cell text-subtitle-2 font-weight-bold" @click="viewDetail(item)">{{
              item.name
            }}</span>
            <v-chip size="small" variant="tonal" color="info">{{ item.statusName }}</v-chip>
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            {{ item.clientName }} · {{ item.typeName }}
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

  <ProjectDetailDrawer
    v-model:open="detailDrawerOpen"
    :project="selectedProject ?? null"
    :loading="detailLoading"
    :has-update-permission="canUpdate"
    @edit="openEditForm"
  >
    <template #header>
      <div class="flex-grow-1">
        <div class="d-flex ga-3">
          <div
            class="detail-drawer__icon-box flex-shrink-0"
            role="button"
            aria-label="Cerrar detalle"
            @click="closeDetail"
          >
            <v-icon :icon="mdiChevronRight" size="20" />
          </div>
          <div>
            <div class="text-h6 font-weight-bold">Detalle de proyecto</div>
            <div v-if="selectedProject" class="text-body-2 text-medium-emphasis">
              {{ selectedProject.name }}
            </div>
          </div>
        </div>

        <div
          v-if="selectedProject && canChangeStatus && selectedProject.actions.includes(ACTION.STATUS)"
          class="mt-3"
        >
          <div class="text-subtitle-1 font-weight-bold text-primary">Estado</div>
          <div class="status-box w-100 pa-3">
            <div class="d-flex flex-column flex-md-row ga-2">
              <v-select
                v-model="selectedStatusId"
                :items="statusOptions ?? []"
                item-title="name"
                item-value="id"
                label="Seleccionar"
                variant="outlined"
                density="compact"
                hide-details
                class="flex-grow-1"
              />
              <v-btn
                color="primary"
                :prepend-icon="mdiContentSave"
                :loading="updateStatusMutation.isPending.value"
                :disabled="!canSaveStatus"
                class="flex-shrink-0"
                @click="updateStatusMutation.mutate()"
              >
                Guardar
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </template>
  </ProjectDetailDrawer>
</template>

<style scoped>
.project-block--divided {
  border-top: thin solid rgba(var(--v-theme-on-surface), 0.12);
}

:deep(.v-data-table-header__sort-icon) {
  font-size: 1.125rem;
}

.status-box {
  border: 1px solid rgb(var(--v-theme-primary));
  border-radius: 12px;
}

.status-box :deep(.v-label) {
  font-size: 0.8125rem;
}
</style>
