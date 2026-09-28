<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { mdiEyeOutline, mdiPencilOutline } from '@mdi/js'
import { getStaffDetailAction, getStaffListAction } from '@/actions'
import { usePermissions } from '@/composables/usePermissions'
import { ACTION } from '@/constants/actions.constants'
import { ROUTE } from '@/router/route-names'
import {
  identificationTypeLabel,
  parseStaffQuery,
  staffQueryToRoute,
  type StaffListItem,
  type StaffQueryParams,
  type StaffSort,
} from '@/models'
import ListControls from '@/components/common/ListControls.vue'
import StaffDetailDrawer from '@/components/detail/StaffDetailDrawer.vue'
import ListFooter from '@/components/common/ListFooter.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'
import AlertComponent from '@/components/common/AlertComponent.vue'

const { smAndDown } = useDisplay()
const route = useRoute()
const router = useRouter()
const { hasPermission } = usePermissions()
const canCreate = computed(() => hasPermission('create'))
const canUpdate = computed(() => hasPermission('update'))

const query = computed<StaffQueryParams>(() => parseStaffQuery(route.query))

// Encadena patches del mismo tick sobre el último estado pedido, no sobre la ruta aún sin propagar.
let pendingQuery: StaffQueryParams | null = null

function patchQuery(patch: Partial<StaffQueryParams>) {
  const next: StaffQueryParams = { ...(pendingQuery ?? query.value), ...patch }
  if (!('page' in patch)) next.page = 1
  pendingQuery = next
  void router.replace({ query: { ...staffQueryToRoute(next), ...detailQueryParam.value } }).finally(() => {
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

const sort = computed<StaffSort>(() => query.value.sort)
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

const listQueryKey = computed(() => ['staff', { ...query.value }])

const { data: listResult, isPending, isError } = useQuery({
  queryKey: listQueryKey,
  queryFn: () => getStaffListAction({ ...query.value }),
  placeholderData: keepPreviousData,
})

const items = computed<StaffListItem[]>(() => listResult.value?.data ?? [])
const totalItems = computed(() => listResult.value?.meta.total ?? 0)
const pageCount = computed(() => listResult.value?.meta.pageCount ?? 1)

watch(pageCount, (count) => {
  if (count >= 1 && query.value.page > count) patchQuery({ page: count })
})

const headers = [
  { title: 'Nombre', key: 'firstName', sortable: true },
  { title: 'Tipo de identificación', key: 'identificationType', sortable: false },
  { title: 'N° de identificación', key: 'identificationNumber', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]

const { data: selectedStaff, isPending: detailLoading } = useQuery({
  queryKey: computed(() => ['staff', 'detail', detailId.value]),
  queryFn: () => getStaffDetailAction(detailId.value as number),
  enabled: computed(() => detailId.value !== null),
})

function viewDetail(item: { id: number }) {
  openDetail(item.id)
}

function openCreateForm() {
  router.push({ name: ROUTE.STAFF_NEW })
}

function openEditForm(item: { id: number }) {
  router.push({ name: ROUTE.STAFF_EDIT, params: { id: String(item.id) } })
}
</script>

<template>
  <div class="mb-6">
    <h1 class="text-h5 font-weight-bold">Lista de colaboradores</h1>
    <p class="text-body-2 text-medium-emphasis mt-1">
      Colaboradores registrados en el sistema.
    </p>
  </div>

  <ListControls
    v-model:search="searchInput"
    search-placeholder="Buscar por nombre o identificación"
    new-label="Nuevo"
    :show-export="false"
    :show-new="canCreate"
    :show-filter="false"
    @new="openCreateForm"
  />

  <v-alert v-if="isError" type="error" variant="tonal" density="compact" class="mb-4 text-caption">
    No se pudo cargar la lista de colaboradores.
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

    <template #item.identificationType="{ item }">
      {{ identificationTypeLabel(item.identificationType) }}
    </template>

    <template #item.identificationNumber="{ item }">
      {{ item.identificationNumber }}
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
        <div class="pa-4" :class="{ 'staff-block--divided': index > 0 }">
          <span class="link-cell text-subtitle-2 font-weight-bold" @click="viewDetail(item)">{{
            item.fullName
          }}</span>
          <div class="text-caption text-medium-emphasis mt-1">
            {{ identificationTypeLabel(item.identificationType) }} {{ item.identificationNumber }}
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

  <StaffDetailDrawer
    v-model:open="detailDrawerOpen"
    :staff="selectedStaff ?? null"
    :loading="detailLoading"
    :has-update-permission="canUpdate"
    @edit="openEditForm"
  />
</template>

<style scoped>
.staff-block--divided {
  border-top: thin solid rgba(var(--v-theme-on-surface), 0.12);
}

:deep(.v-data-table-header__sort-icon) {
  font-size: 1.125rem;
}
</style>
