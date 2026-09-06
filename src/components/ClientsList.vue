<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
import messages from '@/messages'
import type { ClientForm, ClientListItem } from '@/models/client/client.models'
import ListControls from '@/components/common/ListControls.vue'
import ActiveFilters from '@/components/common/ActiveFilters.vue'
import ClientFiltersDrawer from '@/components/ClientFiltersDrawer.vue'
import ClientDetailDrawer from '@/components/common/ClientDetailDrawer.vue'
import ClientFormDialog from '@/components/ClientFormDialog.vue'
import ConfirmStatusDialog from '@/components/common/ConfirmStatusDialog.vue'
import ListFooter from '@/components/common/ListFooter.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'

const { smAndDown } = useDisplay()
const store = useClientsStore()
const queryClient = useQueryClient()
const { toastSaved, toastToggled, toastFailed } = useMessage()

const searchInput = ref(store.filters.search)
let debounceTimer: ReturnType<typeof setTimeout>
watch(searchInput, (value) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    store.filters.search = value
    store.page = 1
  }, 350)
})

const filtersOpen = ref(false)
watch(
  () => store.filters.active,
  () => {
    store.page = 1
  },
)

const activeFilters = computed(() => {
  if (store.filters.active === null) return []
  return [{ key: 'active', label: `Estado: ${store.filters.active ? 'Activos' : 'Inactivos'}` }]
})

function removeFilter() {
  store.filters.active = null
}

function clearAllFilters() {
  store.filters.active = null
}

const listQueryKey = computed(() => [
  'clients',
  { ...store.filters, page: store.page, size: store.size },
])

const { data: listResult, isPending, isError } = useQuery({
  queryKey: listQueryKey,
  queryFn: () => getClientListAction({ ...store.filters, page: store.page, size: store.size }),
  placeholderData: keepPreviousData,
})

const items = computed<ClientListItem[]>(() => listResult.value?.data ?? [])
const totalItems = computed(() => listResult.value?.meta.total ?? 0)
const pageCount = computed(() => listResult.value?.meta.pageCount ?? 1)

watch(pageCount, (count) => {
  if (count >= 1 && store.page > count) store.page = count
})

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Estado', key: 'active' },
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
    @filter="filtersOpen = true"
    @new="openCreateForm"
  />

  <ActiveFilters
    :filters="activeFilters"
    @remove-filter="removeFilter"
    @clear-all="clearAllFilters"
  />

  <v-alert v-if="isError" type="error" variant="tonal" density="compact" class="mb-4">
    No se pudo cargar la lista de mandantes.
  </v-alert>

  <v-data-table-server
    v-if="!smAndDown"
    v-model:page="store.page"
    v-model:items-per-page="store.size"
    :headers="headers"
    :items="items"
    :items-length="totalItems"
    :loading="isPending"
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
        v-model:page="store.page"
        v-model:size="store.size"
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
            <v-btn size="small" variant="text" :prepend-icon="mdiPencilOutline" @click="openEditForm(item)">
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
      v-model:page="store.page"
      v-model:size="store.size"
      :total="totalItems"
      :page-count="pageCount"
      class="mt-2"
    />
  </template>

  <ClientFiltersDrawer
    v-model:open="filtersOpen"
    v-model:active="store.filters.active"
    @clear="clearAllFilters"
  />

  <ClientDetailDrawer
    v-model:open="store.detailOpen"
    :client="selectedClient ?? null"
    :loading="detailLoading"
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
</style>
