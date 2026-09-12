<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { mdiEyeOutline, mdiPencilOutline } from '@mdi/js'
import {
  createProjectSpecialtyAction,
  getProjectSpecialtyDetailAction,
  getProjectSpecialtyListAction,
  toggleProjectSpecialtyActiveAction,
  updateProjectSpecialtyAction,
} from '@/actions/projectSpecialty/projectSpecialty.actions'
import { useProjectSpecialtiesStore } from '@/stores/projectSpecialties'
import { useMessage } from '@/composables/useMessage'
import { usePermissions } from '@/composables/usePermissions'
import { ACTION } from '@/constants/actions.constants'
import messages from '@/messages'
import {
  projectSpecialtyQueryToRoute,
  parseProjectSpecialtyQuery,
  type ProjectSpecialtyForm,
  type ProjectSpecialtyListItem,
  type ProjectSpecialtyQueryParams,
  type ProjectSpecialtySort,
} from '@/models/projectSpecialty/projectSpecialty.models'
import ListControls from '@/components/common/ListControls.vue'
import ActiveFilters from '@/components/common/ActiveFilters.vue'
import ProjectSpecialtyFiltersDrawer from '@/components/ProjectSpecialtyFiltersDrawer.vue'
import ProjectSpecialtyDetailDrawer from '@/components/common/ProjectSpecialtyDetailDrawer.vue'
import ProjectSpecialtyFormDialog from '@/components/ProjectSpecialtyFormDialog.vue'
import ConfirmStatusDialog from '@/components/common/ConfirmStatusDialog.vue'
import ListFooter from '@/components/common/ListFooter.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'

const { smAndDown } = useDisplay()
const route = useRoute()
const router = useRouter()
const store = useProjectSpecialtiesStore()
const queryClient = useQueryClient()
const { toastSaved, toastToggled, toastFailed } = useMessage()
const { hasPermission } = usePermissions()
const canCreate = computed(() => hasPermission('create'))
const canUpdate = computed(() => hasPermission('update'))
const canToggleActive = computed(() => hasPermission('active'))

const query = computed<ProjectSpecialtyQueryParams>(() => parseProjectSpecialtyQuery(route.query))

// Encadena patches del mismo tick sobre el último estado pedido, no sobre la ruta aún sin propagar.
let pendingQuery: ProjectSpecialtyQueryParams | null = null

function patchQuery(patch: Partial<ProjectSpecialtyQueryParams>) {
  const next: ProjectSpecialtyQueryParams = { ...(pendingQuery ?? query.value), ...patch }
  if (!('page' in patch)) next.page = 1
  pendingQuery = next
  void router.replace({ query: projectSpecialtyQueryToRoute(next) }).finally(() => {
    pendingQuery = null
  })
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

const activeFilter = computed<boolean | null>({
  get: () => query.value.active,
  set: (value) => patchQuery({ active: value }),
})

const activeFilters = computed(() => {
  if (query.value.active === null) return []
  return [{ key: 'active', label: `Estado: ${query.value.active ? 'Activos' : 'Inactivos'}` }]
})

function clearActiveFilter() {
  patchQuery({ active: null })
}

const sort = computed<ProjectSpecialtySort>(() => query.value.sort)
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

const listQueryKey = computed(() => ['projectSpecialties', { ...query.value }])

const { data: listResult, isPending, isError } = useQuery({
  queryKey: listQueryKey,
  queryFn: () => getProjectSpecialtyListAction({ ...query.value }),
  placeholderData: keepPreviousData,
})

const items = computed<ProjectSpecialtyListItem[]>(() => listResult.value?.data ?? [])
const totalItems = computed(() => listResult.value?.meta.total ?? 0)
const pageCount = computed(() => listResult.value?.meta.pageCount ?? 1)

watch(pageCount, (count) => {
  if (count >= 1 && query.value.page > count) patchQuery({ page: count })
})

const headers = [
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Estado', key: 'active', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]

const { data: selectedProjectSpecialty, isPending: detailLoading } = useQuery({
  queryKey: computed(() => ['projectSpecialties', 'detail', store.selectedId]),
  queryFn: () => getProjectSpecialtyDetailAction(store.selectedId as number),
  enabled: computed(() => store.selectedId !== null),
})

function viewDetail(item: ProjectSpecialtyListItem) {
  store.openDetail(item.id)
}

const editingProjectSpecialty = ref<{ id: number; name: string } | null>(null)
const formDialogRef = ref<InstanceType<typeof ProjectSpecialtyFormDialog> | null>(null)

function openCreateForm() {
  editingProjectSpecialty.value = null
  store.openCreateForm()
}

function openEditForm(item: ProjectSpecialtyListItem) {
  editingProjectSpecialty.value = { id: item.id, name: item.name }
  store.openEditForm(item.id)
}

async function saveProjectSpecialty(form: ProjectSpecialtyForm): Promise<void> {
  if (form.id) {
    await updateProjectSpecialtyAction(form)
  } else {
    await createProjectSpecialtyAction(form)
  }
}

const saveMutation = useMutation({
  mutationFn: saveProjectSpecialty,
  onSuccess: (_data, form) => {
    queryClient.invalidateQueries({ queryKey: ['projectSpecialties'] })
    store.formOpen = false
    toastSaved(form.id, messages.projectSpecialty)
  },
  onError: (error: unknown) => {
    formDialogRef.value?.reportError(error)
    toastFailed(messages.projectSpecialty)
  },
})

function submitForm(form: ProjectSpecialtyForm) {
  saveMutation.mutate(form)
}

const statusDialogRef = ref<InstanceType<typeof ConfirmStatusDialog> | null>(null)
const statusRecord = ref<{ id: number; name: string; active: boolean } | null>(null)

function askToggleActive(item: { id: number; name: string; active: boolean }) {
  statusRecord.value = { id: item.id, name: item.name, active: item.active }
  statusDialogRef.value?.open()
}

const toggleMutation = useMutation({
  mutationFn: (id: number) => toggleProjectSpecialtyActiveAction(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projectSpecialties'] })
    store.detailOpen = false
    statusDialogRef.value?.close()
    if (statusRecord.value) toastToggled(statusRecord.value.active, messages.projectSpecialty)
  },
  onError: () => {
    toastFailed(messages.projectSpecialty)
  },
})

function confirmToggleActive() {
  if (statusRecord.value) toggleMutation.mutate(statusRecord.value.id)
}
</script>

<template>
  <div class="mb-6">
    <h1 class="text-h4 font-weight-bold">Especialidades</h1>
    <p class="text-body-2 text-medium-emphasis mt-1">
      Mantenedor de especialidades utilizadas en la asignación de proyectos.
    </p>
  </div>

  <ListControls
    v-model:search="searchInput"
    search-placeholder="Buscar por nombre"
    new-label="Nueva"
    :show-export="false"
    :show-new="canCreate"
    @filter="filtersOpen = true"
    @new="openCreateForm"
  />

  <ActiveFilters
    :filters="activeFilters"
    @remove-filter="clearActiveFilter"
    @clear-all="clearActiveFilter"
  />

  <v-alert v-if="isError" type="error" variant="tonal" density="compact" class="mb-4">
    No se pudo cargar la lista de especialidades.
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
        <div class="pa-4" :class="{ 'project-specialty-block--divided': index > 0 }">
          <div class="d-flex flex-wrap align-center justify-space-between ga-2">
            <span class="link-cell text-subtitle-2 font-weight-bold" @click="viewDetail(item)">{{
              item.name
            }}</span>
            <v-chip size="small" variant="tonal" :color="item.status.color">
              {{ item.status.label }}
            </v-chip>
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

      <div v-if="!items.length" class="pa-8 text-center text-medium-emphasis">
        No hay especialidades que coincidan con los filtros aplicados.
      </div>
    </v-card>

    <ListFooter
      v-model:page="pageModel"
      v-model:size="sizeModel"
      :total="totalItems"
      :page-count="pageCount"
      class="mt-2"
    />
  </template>

  <ProjectSpecialtyFiltersDrawer
    v-model:open="filtersOpen"
    v-model:active="activeFilter"
    @clear="clearActiveFilter"
  />

  <ProjectSpecialtyDetailDrawer
    v-model:open="store.detailOpen"
    :project-specialty="selectedProjectSpecialty ?? null"
    :loading="detailLoading"
    :has-update-permission="canUpdate"
    :has-active-permission="canToggleActive"
    @edit="openEditForm"
    @toggle-active="askToggleActive"
  />

  <ProjectSpecialtyFormDialog
    ref="formDialogRef"
    v-model:open="store.formOpen"
    :project-specialty="editingProjectSpecialty"
    :loading="saveMutation.isPending.value"
    @submit="submitForm"
  />

  <ConfirmStatusDialog
    ref="statusDialogRef"
    :record="statusRecord"
    :loading="toggleMutation.isPending.value"
    entity="especialidad"
    @confirm="confirmToggleActive"
  />
</template>

<style scoped>
.project-specialty-block--divided {
  border-top: thin solid rgba(var(--v-theme-on-surface), 0.12);
}

:deep(.v-data-table-header__sort-icon) {
  font-size: 1.125rem;
}
</style>
