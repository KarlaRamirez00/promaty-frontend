<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { mdiChevronRight, mdiContentSave } from '@mdi/js'
import {
  getClientOptionsAction,
  getProjectDetailAction,
  getProjectListAction,
  getProjectSpecialtyOptionsAction,
  getProjectStatusOptionsAction,
  getProjectTypeOptionsAction,
  updateProjectStatusAction,
} from '@/actions'
import { useActiveFilters } from '@/composables/useActiveFilters'
import { useDetailSlide } from '@/composables/useDetailSlide'
import { useListQuery } from '@/composables/useListQuery'
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
} from '@/models'
import ListControls from '@/components/common/ListControls.vue'
import ActiveFilters from '@/components/common/ActiveFilters.vue'
import FiltersDrawer, { type FilterField } from '@/components/common/FiltersDrawer.vue'
import ProjectDetailDrawer from '@/components/detail/ProjectDetailDrawer.vue'
import ListFooter from '@/components/common/ListFooter.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'

const router = useRouter()
const { hasPermission } = usePermissions()
const canCreate = computed(() => hasPermission('create'))

const {
  detailId,
  detailQueryParam,
  isOpen: detailDrawerOpen,
  open: openDetail,
  close: closeDetail,
  record: selectedProject,
  isLoading: detailLoading,
} = useDetailSlide('projects', getProjectDetailAction)

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
} = useListQuery<ProjectQueryParams, ProjectListItem>({
  resource: 'projects',
  parse: parseProjectQuery,
  toRoute: projectQueryToRoute,
  fetch: getProjectListAction,
  extraRouteQuery: () => detailQueryParam.value,
})

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

const { activeFilters, clearFilter, clearAllFilters } = useActiveFilters<ProjectQueryParams>({
  patchQuery,
  resetAll: { typeId: null, specialtyId: null, clientId: null, statusId: null },
  chips: () => {
    const chips = []
    const typeName = typeOptions.value?.find((o) => o.id === query.value.typeId)?.name
    const specialtyName = specialtyOptions.value?.find((o) => o.id === query.value.specialtyId)?.name
    const clientName = clientOptions.value?.find((o) => o.id === query.value.clientId)?.name
    const statusName = statusOptions.value?.find((o) => o.id === query.value.statusId)?.name
    if (typeName) chips.push({ key: 'typeId', label: `Tipo: ${typeName}` })
    if (specialtyName) chips.push({ key: 'specialtyId', label: `Especialidad: ${specialtyName}` })
    if (clientName) chips.push({ key: 'clientId', label: `Mandante: ${clientName}` })
    if (statusName) chips.push({ key: 'statusId', label: `Estado: ${statusName}` })
    return chips
  },
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
  mutationFn: () => {
    const projectId = detailId.value
    const statusId = selectedStatusId.value
    if (projectId === null || statusId === null) throw new Error('Falta el proyecto o el estado')
    return updateProjectStatusAction(projectId, statusId)
  },
  onSuccess: () => {
    snackbar.success(messages.project.toastStatusUpdated)
    return queryClient.invalidateQueries({ queryKey: ['projects'] })
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
    <h1 class="text-h5 font-weight-bold">Lista de proyectos</h1>
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

  <v-alert v-if="isError" type="error" variant="tonal" density="compact" class="mb-4 text-caption">
    No se pudo cargar la lista de proyectos.
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

    <template #item.statusName="{ item }">
      <v-chip size="small" variant="tonal" :color="item.statusColor">
        {{ item.statusName }}
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <ActionsMenu
        :record="item"
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
    @edit="openEditForm"
  >
    <template #header>
      <div class="flex-grow-1">
        <div class="d-flex ga-3">
          <button
            type="button"
            class="detail-drawer__icon-box flex-shrink-0"
            aria-label="Cerrar detalle"
            @click="closeDetail"
          >
            <v-icon :icon="mdiChevronRight" size="20" />
          </button>
          <div>
            <div class="text-h6 font-weight-bold">Detalle de proyecto</div>
            <div v-if="selectedProject" class="text-body-2 text-medium-emphasis">
              {{ selectedProject.name }}
            </div>
          </div>
        </div>

        <div
          v-if="selectedProject?.actions.includes(ACTION.STATUS)"
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
