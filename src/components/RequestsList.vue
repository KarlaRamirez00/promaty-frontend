<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import {
  mdiAlertCircleOutline,
  mdiCalendarBlankOutline,
  mdiCheck,
  mdiClockOutline,
  mdiClose,
  mdiDotsHorizontal,
  mdiEyeOutline,
} from '@mdi/js'
import { requests } from '../data/requests'
import type { Request, RequestStatus } from '../types/request'
import ListControls from './common/ListControls.vue'
import ActiveFilters from './common/ActiveFilters.vue'
import FiltersDrawer from './common/FiltersDrawer.vue'
import RequestDetailDrawer from './common/RequestDetailDrawer.vue'
import IndicatorCard from './common/IndicatorCard.vue'

const { smAndDown } = useDisplay()

const search = ref('')

const detailOpen = ref(false)
const selectedRequest = ref<Request | null>(null)

function viewDetail(request: Request) {
  selectedRequest.value = request
  detailOpen.value = true
}

// Fecha en los datos mock viene como dd/mm/yyyy; se convierte para poder
// compararla contra los inputs type="date" (yyyy-mm-dd) del panel de filtros.
function parseCreatedAt(value: string): Date {
  const [day, month, year] = value.split('/').map(Number)
  return new Date(year, month - 1, day)
}

const filtersOpen = ref(false)
const filterStatus = ref<RequestStatus | null>(null)
const filterCc = ref<string | null>(null)
const filterRequester = ref<string | null>(null)
const filterDateFrom = ref<string | null>(null)
const filterDateTo = ref<string | null>(null)

const ccOptions = computed(() => [...new Set(requests.map((r) => r.cc))].sort())
const requesterOptions = computed(() => [...new Set(requests.map((r) => r.requester))].sort())

const filteredRequests = computed(() => {
  const query = search.value.trim().toLowerCase()
  const from = filterDateFrom.value ? new Date(filterDateFrom.value) : null
  const to = filterDateTo.value ? new Date(filterDateTo.value) : null

  return requests.filter((r) => {
    if (filterStatus.value && r.status !== filterStatus.value) return false
    if (filterCc.value && r.cc !== filterCc.value) return false
    if (filterRequester.value && r.requester !== filterRequester.value) return false

    const createdAt = parseCreatedAt(r.createdAt)
    if (from && createdAt < from) return false
    if (to && createdAt > to) return false

    if (query && !r.type.toLowerCase().includes(query) && !r.cc.toLowerCase().includes(query)) {
      return false
    }

    return true
  })
})

const page = ref(1)
const itemsPerPage = ref(10)
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRequests.value.length / itemsPerPage.value)),
)
const pageText = computed(() => `Página ${page.value} de ${totalPages.value}`)

// La vista en bloques pagina manualmente y no reajusta la página al filtrar.
watch(totalPages, () => {
  if (page.value > totalPages.value) page.value = 1
})

const paginatedRequests = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  return filteredRequests.value.slice(start, start + itemsPerPage.value)
})

const activeFilters = computed(() => {
  const active: { key: string; label: string }[] = []
  if (filterStatus.value) active.push({ key: 'status', label: `Estado: ${filterStatus.value}` })
  if (filterCc.value) active.push({ key: 'cc', label: `Centro de costo: ${filterCc.value}` })
  if (filterRequester.value) active.push({ key: 'requester', label: `Solicitante: ${filterRequester.value}` })
  if (filterDateFrom.value) active.push({ key: 'dateFrom', label: `Desde: ${filterDateFrom.value}` })
  if (filterDateTo.value) active.push({ key: 'dateTo', label: `Hasta: ${filterDateTo.value}` })
  return active
})

function removeFilter(key: string) {
  if (key === 'status') filterStatus.value = null
  if (key === 'cc') filterCc.value = null
  if (key === 'requester') filterRequester.value = null
  if (key === 'dateFrom') filterDateFrom.value = null
  if (key === 'dateTo') filterDateTo.value = null
}

function clearAllFilters() {
  filterStatus.value = null
  filterCc.value = null
  filterRequester.value = null
  filterDateFrom.value = null
  filterDateTo.value = null
}

const headers = [
  { title: 'CC', key: 'cc' },
  { title: 'Tipo de solicitud', key: 'type' },
  { title: 'Proyecto', key: 'project' },
  { title: 'Creación', key: 'createdAt' },
  { title: 'Solicitante', key: 'requester' },
  { title: 'Estado', key: 'status' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]

const pendingApproval = computed(
  () => requests.filter((r) => r.status === 'Pendiente aprobación').length,
)
const pendingValidation = computed(
  () => requests.filter((r) => r.status === 'Pendiente validación').length,
)

const statusColor: Record<RequestStatus, string> = {
  'Pendiente aprobación': 'warning',
  'Pendiente validación': 'info',
  Aprobado: 'success',
  Rechazado: 'error',
}
</script>

<template>
  <div class="list-header mb-6">
    <div class="list-header__text">
      <h1 class="text-h4 font-weight-bold">Lista de solicitudes</h1>
      <p class="text-body-2 text-medium-emphasis mt-1">
        Revisa las solicitudes pendientes de <strong>aprobación</strong> y <strong>revisión</strong>.
      </p>
    </div>

    <div class="list-header__indicators">
      <IndicatorCard
        :icon="mdiAlertCircleOutline"
        color="warning"
        title="Por aprobar"
        :count="pendingApproval"
      />
      <IndicatorCard
        :icon="mdiClockOutline"
        color="info"
        title="Por validar"
        :count="pendingValidation"
      />
    </div>
  </div>

  <ListControls
    v-model:search="search"
    search-placeholder="Buscar por tipo de solicitud o centro de costo"
    @filter="filtersOpen = true"
  />

  <ActiveFilters
    :filters="activeFilters"
    @remove-filter="removeFilter"
    @clear-all="clearAllFilters"
  />

  <v-data-table
    v-if="!smAndDown"
    v-model:page="page"
    v-model:items-per-page="itemsPerPage"
    :headers="headers"
    :items="filteredRequests"
    :page-text="pageText"
  >
    <template #item.type="{ item }">
      <v-chip
        size="small"
        variant="tonal"
        style="cursor: pointer"
        @click="viewDetail(item)"
      >
        {{ item.type }}
      </v-chip>
    </template>

    <template #item.createdAt="{ item }">
      <v-chip size="small" variant="outlined" :prepend-icon="mdiCalendarBlankOutline">
        {{ item.createdAt }}
      </v-chip>
    </template>

    <template #item.status="{ item }">
      <v-chip size="small" variant="tonal" :color="statusColor[item.status as RequestStatus]">
        {{ item.status }}
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <v-menu>
        <template #activator="{ props }">
          <v-btn :icon="mdiDotsHorizontal" variant="text" size="small" v-bind="props" />
        </template>
        <v-list density="compact">
          <v-list-item title="Ver detalle" :prepend-icon="mdiEyeOutline" @click="viewDetail(item)" />
          <v-list-item title="Aprobar" :prepend-icon="mdiCheck" />
          <v-list-item title="Rechazar" :prepend-icon="mdiClose" />
        </v-list>
      </v-menu>
    </template>
  </v-data-table>

  <template v-else>
    <v-card flat border>
      <template
        v-for="(item, index) in paginatedRequests"
        :key="`${item.cc}-${item.type}-${item.createdAt}-${item.requester}`"
      >
        <div class="pa-4" :class="{ 'request-block--divided': index > 0 }">
          <div class="d-flex flex-wrap align-center ga-2 mb-3">
            <v-chip
              size="small"
              variant="tonal"
              style="cursor: pointer"
              @click="viewDetail(item)"
            >
              {{ item.type }}
            </v-chip>
            <v-chip size="small" variant="tonal" :color="statusColor[item.status]">
              {{ item.status }}
            </v-chip>
          </div>

          <dl class="request-block__fields">
            <div class="request-block__field">
              <dt>CC</dt>
              <dd>{{ item.cc }}</dd>
            </div>
            <div class="request-block__field">
              <dt>Proyecto</dt>
              <dd>{{ item.project }}</dd>
            </div>
            <div class="request-block__field">
              <dt>Creación</dt>
              <dd>{{ item.createdAt }}</dd>
            </div>
            <div class="request-block__field">
              <dt>Solicitante</dt>
              <dd>{{ item.requester }}</dd>
            </div>
          </dl>

          <div class="d-flex flex-wrap ga-2 mt-3">
            <v-btn
              size="small"
              variant="tonal"
              :prepend-icon="mdiEyeOutline"
              @click="viewDetail(item)"
            >
              Ver detalle
            </v-btn>
            <v-btn size="small" variant="text" :prepend-icon="mdiCheck">Aprobar</v-btn>
            <v-btn size="small" variant="text" :prepend-icon="mdiClose">Rechazar</v-btn>
          </div>
        </div>
      </template>

      <div
        v-if="!paginatedRequests.length"
        class="pa-8 text-center text-medium-emphasis"
      >
        No hay solicitudes que coincidan con los filtros aplicados.
      </div>
    </v-card>

    <div v-if="totalPages > 1" class="d-flex flex-column align-center ga-1 mt-4">
      <v-pagination
        v-model="page"
        :length="totalPages"
        :total-visible="5"
        density="comfortable"
        rounded="circle"
      />
      <span class="text-caption text-medium-emphasis">{{ pageText }}</span>
    </div>
  </template>

  <FiltersDrawer
    v-model:open="filtersOpen"
    v-model:status="filterStatus"
    v-model:cc="filterCc"
    v-model:requester="filterRequester"
    v-model:date-from="filterDateFrom"
    v-model:date-to="filterDateTo"
    :cc-options="ccOptions"
    :requester-options="requesterOptions"
    @clear="clearAllFilters"
  />

  <RequestDetailDrawer v-model:open="detailOpen" :request="selectedRequest" />
</template>

<style scoped>
.list-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-header__indicators {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 600px) {
  .list-header__indicators {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .list-header__indicators > * {
    flex: 1 1 200px;
  }
}

@media (min-width: 960px) {
  .list-header {
    flex-direction: row;
    align-items: flex-start;
    gap: 24px;
  }

  .list-header__text {
    flex: 1 1 auto;
  }

  .list-header__indicators {
    flex: 0 1 480px;
  }
}

.request-block--divided {
  border-top: thin solid rgba(var(--v-theme-on-surface), 0.12);
}

.request-block__fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
}

.request-block__field {
  display: flex;
  flex-wrap: wrap;
  gap: 0.125rem 0.75rem;
}

.request-block__field dt {
  min-width: 88px;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6);
  align-self: center;
}

.request-block__field dd {
  margin: 0;
  font-size: 0.875rem;
}
</style>
