<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { mdiEyeOutline, mdiPencilOutline } from '@mdi/js'
import {
  createClientAction,
  getClientDetailAction,
  getClientListAction,
  toggleClientActiveAction,
  updateClientAction,
} from '@/actions/client/client.actions'
import { useClientsStore } from '@/stores/clients'
import { useMessage } from '@/composables/useMessage'
import { usePermissions } from '@/composables/usePermissions'
import { ACTION } from '@/constants/actions.constants'
import messages from '@/messages'
import {
  clientQueryToRoute,
  parseClientQuery,
  type ClientForm,
  type ClientListItem,
  type ClientQueryParams,
  type ClientSort,
} from '@/models/client/client.models'
import ListControls from '@/components/common/ListControls.vue'
import ActiveFilters from '@/components/common/ActiveFilters.vue'
import ClientFiltersDrawer from '@/components/ClientFiltersDrawer.vue'
import ClientDetailDrawer from '@/components/common/ClientDetailDrawer.vue'
import ClientFormDialog from '@/components/ClientFormDialog.vue'
import ConfirmStatusDialog from '@/components/common/ConfirmStatusDialog.vue'
import ListFooter from '@/components/common/ListFooter.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'

const { smAndDown } = useDisplay()
const route = useRoute()
const router = useRouter()
const store = useClientsStore()
const queryClient = useQueryClient()
const { toastSaved, toastToggled, toastFailed } = useMessage()
const { hasPermission } = usePermissions()
const canCreate = computed(() => hasPermission('create'))
const canUpdate = computed(() => hasPermission('update'))
const canToggleActive = computed(() => hasPermission('active'))

const query = computed<ClientQueryParams>(() => parseClientQuery(route.query))

// Encadena patches del mismo tick sobre el último estado pedido, no sobre la ruta aún sin propagar.
let pendingQuery: ClientQueryParams | null = null

function patchQuery(patch: Partial<ClientQueryParams>) {
  const next: ClientQueryParams = { ...(pendingQuery ?? query.value), ...patch }
  if (!('page' in patch)) next.page = 1
  pendingQuery = next
  void router.replace({ query: clientQueryToRoute(next) }).finally(() => {
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

const sort = computed<ClientSort>(() => query.value.sort)
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

const listQueryKey = computed(() => ['clients', { ...query.value }])

const { data: listResult, isPending, isError } = useQuery({
  queryKey: listQueryKey,
  queryFn: () => getClientListAction({ ...query.value }),
  placeholderData: keepPreviousData,
})

const items = computed<ClientListItem[]>(() => listResult.value?.data ?? [])
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

const { data: selectedClient, isPending: detailLoading } = useQuery({
  queryKey: computed(() => ['clients', 'detail', store.selectedId]),
  queryFn: () => getClientDetailAction(store.selectedId as number),
  enabled: computed(() => store.selectedId !== null),
})

function viewDetail(item: ClientListItem) {
  store.openDetail(item.id)
}

const editingClient = ref<{ id: number; name: string } | null>(null)
const formDialogRef = ref<InstanceType<typeof ClientFormDialog> | null>(null)

function openCreateForm() {
  editingClient.value = null
  store.openCreateForm()
}

function openEditForm(item: ClientListItem) {
  editingClient.value = { id: item.id, name: item.name }
  store.openEditForm(item.id)
}

async function saveClient(form: ClientForm): Promise<void> {
  if (form.id) {
    await updateClientAction(form)
  } else {
    await createClientAction(form)
  }
}

const saveMutation = useMutation({
  mutationFn: saveClient,
  onSuccess: (_data, form) => {
    queryClient.invalidateQueries({ queryKey: ['clients'] })
    store.formOpen = false
    toastSaved(form.id, messages.client)
  },
  onError: (error: unknown) => {
    formDialogRef.value?.reportError(error)
    toastFailed(messages.client)
  },
})

function submitForm(form: ClientForm) {
  saveMutation.mutate(form)
}

const statusDialogRef = ref<InstanceType<typeof ConfirmStatusDialog> | null>(null)
const statusRecord = ref<{ id: number; name: string; active: boolean } | null>(null)

function askToggleActive(item: { id: number; name: string; active: boolean }) {
  statusRecord.value = { id: item.id, name: item.name, active: item.active }
  statusDialogRef.value?.open()
}

const toggleMutation = useMutation({
  mutationFn: (id: number) => toggleClientActiveAction(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] })
    store.detailOpen = false
    statusDialogRef.value?.close()
    if (statusRecord.value) toastToggled(statusRecord.value.active, messages.client)
  },
  onError: () => {
    toastFailed(messages.client)
  },
})

function confirmToggleActive() {
  if (statusRecord.value) toggleMutation.mutate(statusRecord.value.id)
}
</script>

<template>
  <div class="mb-6">
    <h1 class="text-h4 font-weight-bold">Mandantes</h1>
    <p class="text-body-2 text-medium-emphasis mt-1">
      Mantenedor de mandantes utilizados en la asignación de proyectos.
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
    @remove-filter="clearActiveFilter"
    @clear-all="clearActiveFilter"
  />

  <v-alert v-if="isError" type="error" variant="tonal" density="compact" class="mb-4">
    No se pudo cargar la lista de mandantes.
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
        <div class="pa-4" :class="{ 'client-block--divided': index > 0 }">
          <div class="d-flex flex-wrap align-center justify-space-between ga-2">
            <span class="link-cell text-subtitle-2 font-weight-bold" @click="viewDetail(item)">{{ item.name }}</span>
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
        No hay mandantes que coincidan con los filtros aplicados.
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

  <ClientFiltersDrawer
    v-model:open="filtersOpen"
    v-model:active="activeFilter"
    @clear="clearActiveFilter"
  />

  <ClientDetailDrawer
    v-model:open="store.detailOpen"
    :client="selectedClient ?? null"
    :loading="detailLoading"
    :has-update-permission="canUpdate"
    :has-active-permission="canToggleActive"
    @edit="openEditForm"
    @toggle-active="askToggleActive"
  />

  <ClientFormDialog
    ref="formDialogRef"
    v-model:open="store.formOpen"
    :client="editingClient"
    :loading="saveMutation.isPending.value"
    @submit="submitForm"
  />

  <ConfirmStatusDialog
    ref="statusDialogRef"
    :record="statusRecord"
    :loading="toggleMutation.isPending.value"
    entity="mandante"
    @confirm="confirmToggleActive"
  />
</template>

<style scoped>
.client-block--divided {
  border-top: thin solid rgba(var(--v-theme-on-surface), 0.12);
}

:deep(.v-data-table-header__sort-icon) {
  font-size: 1.125rem;
}
</style>
