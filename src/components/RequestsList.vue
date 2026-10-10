<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { mdiAlertCircleOutline, mdiClockOutline } from '@mdi/js'
import {
  approveRequestAction,
  getCostCenterOptionsAction,
  getRejectionReasonOptionsAction,
  getRequestDetailAction,
  getRequesterOptionsAction,
  getRequestListAction,
  getRequestStatusOptionsAction,
  rejectRequestAction,
} from '@/actions'
import { useBackendFieldErrors } from '@/composables/useBackendFieldErrors'
import { useMessage } from '@/composables/useMessage'
import { usePermissions } from '@/composables/usePermissions'
import messages from '@/messages'
import {
  parseRequestQuery,
  requestQueryToRoute,
  type RequestDecisionForm,
  type RequestListItem,
  type RequestQueryParams,
} from '@/models'
import { formatDate } from '@/utils'
import ListControls from '@/components/common/ListControls.vue'
import ActiveFilters from '@/components/common/ActiveFilters.vue'
import FiltersDrawer, { type FilterField } from '@/components/common/FiltersDrawer.vue'
import RequestDetailDrawer from '@/components/detail/RequestDetailDrawer.vue'
import IndicatorCard from '@/components/common/IndicatorCard.vue'
import ListFooter from '@/components/common/ListFooter.vue'
import ActionsMenu from '@/components/common/ActionsMenu.vue'
import AlertComponent from '@/components/common/AlertComponent.vue'
import ApproveRejectDialog, { type DecisionType } from '@/components/common/ApproveRejectDialog.vue'

const { smAndDown } = useDisplay()
const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const { toastDecided, toastFailed } = useMessage()
const { hasPermission } = usePermissions()
const {
  backendErrorFields,
  setFromError,
  clear: clearBackendErrors,
} = useBackendFieldErrors()
const canApprove = computed(() => hasPermission('approve'))
const canValidate = computed(() => hasPermission('validate'))

const query = computed<RequestQueryParams>(() => parseRequestQuery(route.query))

// Encadena patches del mismo tick sobre el último estado pedido, no sobre la ruta aún sin propagar.
let pendingQuery: RequestQueryParams | null = null

function patchQuery(patch: Partial<RequestQueryParams>) {
  const next: RequestQueryParams = { ...(pendingQuery ?? query.value), ...patch }
  if (!('page' in patch)) next.page = 1
  pendingQuery = next
  void router
    .replace({ query: { ...requestQueryToRoute(next), ...detailQueryParam.value } })
    .finally(() => {
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

const { data: statusOptions } = useQuery({
  queryKey: ['requests', 'options', 'statuses'],
  queryFn: getRequestStatusOptionsAction,
})
const { data: costCenterOptions } = useQuery({
  queryKey: ['projects', 'options', 'costCenters'],
  queryFn: getCostCenterOptionsAction,
})
const { data: requesterOptions } = useQuery({
  queryKey: ['requests', 'options', 'requesters'],
  queryFn: getRequesterOptionsAction,
})

const filterFields = computed<FilterField[]>(() => [
  {
    key: 'statusId',
    type: 'select',
    label: 'Estado',
    options: (statusOptions.value ?? []).map((o) => ({ title: o.name, value: o.id })),
  },
  {
    key: 'projectId',
    type: 'autocomplete',
    label: 'Centro de costo',
    options: (costCenterOptions.value ?? []).map((o) => ({ title: o.title, value: o.id })),
  },
  {
    key: 'requesterUserId',
    type: 'autocomplete',
    label: 'Solicitante',
    options: (requesterOptions.value ?? []).map((o) => ({ title: o.name, value: o.id })),
  },
  { key: 'dateRange', type: 'date', label: 'Rango de fechas', range: true },
])

const filterValues = computed<Record<string, unknown>>({
  get: () => ({
    statusId: query.value.statusId,
    projectId: query.value.projectId,
    requesterUserId: query.value.requesterUserId,
    dateRange:
      query.value.createdFrom && query.value.createdTo
        ? [query.value.createdFrom, query.value.createdTo]
        : null,
  }),
  set: (value) => {
    const range = value.dateRange as [string, string] | null | undefined
    patchQuery({
      statusId: (value.statusId as number | null) ?? null,
      projectId: (value.projectId as number | null) ?? null,
      requesterUserId: (value.requesterUserId as number | null) ?? null,
      createdFrom: range?.[0] ?? null,
      createdTo: range?.[1] ?? null,
    })
  },
})

const activeFilters = computed(() => {
  const active: { key: string; label: string }[] = []
  const statusName = statusOptions.value?.find((o) => o.id === query.value.statusId)?.name
  if (statusName) active.push({ key: 'statusId', label: `Estado: ${statusName}` })
  const costCenter = costCenterOptions.value?.find((o) => o.id === query.value.projectId)?.title
  if (costCenter) active.push({ key: 'projectId', label: `Centro de costo: ${costCenter}` })
  const requesterName = requesterOptions.value?.find(
    (o) => o.id === query.value.requesterUserId,
  )?.name
  if (requesterName) active.push({ key: 'requesterUserId', label: `Solicitante: ${requesterName}` })
  if (query.value.createdFrom && query.value.createdTo) {
    active.push({
      key: 'dateRange',
      label: `Fechas: ${formatDate(query.value.createdFrom)} a ${formatDate(query.value.createdTo)}`,
    })
  }
  return active
})

function clearFilter(key: string) {
  if (key === 'dateRange') patchQuery({ createdFrom: null, createdTo: null })
  else patchQuery({ [key]: null })
}

function clearAllFilters() {
  patchQuery({
    statusId: null,
    projectId: null,
    requesterUserId: null,
    createdFrom: null,
    createdTo: null,
  })
}

const pageModel = computed<number>({
  get: () => query.value.page,
  set: (value) => patchQuery({ page: value }),
})

const sizeModel = computed<number>({
  get: () => query.value.size,
  set: (value) => patchQuery({ size: value }),
})

const listQueryKey = computed(() => ['requests', { ...query.value }])

const {
  data: listResult,
  isPending,
  isError,
} = useQuery({
  queryKey: listQueryKey,
  queryFn: () => getRequestListAction({ ...query.value }),
  placeholderData: keepPreviousData,
})

const items = computed<RequestListItem[]>(() => listResult.value?.data ?? [])
const totalItems = computed(() => listResult.value?.meta.total ?? 0)
const pageCount = computed(() => listResult.value?.meta.pageCount ?? 1)
const pendingApproval = computed(() => listResult.value?.meta.otherData?.pendingApproval ?? 0)
const pendingValidation = computed(() => listResult.value?.meta.otherData?.pendingValidation ?? 0)

watch(pageCount, (count) => {
  if (count >= 1 && query.value.page > count) patchQuery({ page: count })
})

function statusIdByCode(code: string): number | null {
  return statusOptions.value?.find((o) => o.code === code)?.id ?? null
}

function isCounterActive(code: string): boolean {
  const id = statusIdByCode(code)
  return id !== null && query.value.statusId === id
}

function toggleCounter(code: string) {
  const id = statusIdByCode(code)
  if (id === null) return
  patchQuery({ statusId: query.value.statusId === id ? null : id })
}

const headers = [
  { title: 'CC', key: 'costCenterCode', sortable: false },
  { title: 'Tipo de solicitud', key: 'typeName', sortable: false },
  { title: 'Proyecto', key: 'projectName', sortable: false },
  { title: 'Creación', key: 'createdAt', sortable: false },
  { title: 'Solicitante', key: 'requesterName', sortable: false },
  { title: 'Estado', key: 'status', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
]

const { data: selectedRequest, isPending: detailLoading } = useQuery({
  queryKey: computed(() => ['requests', 'detail', detailId.value]),
  queryFn: () => getRequestDetailAction(detailId.value as number),
  enabled: computed(() => detailId.value !== null),
})

function viewDetail(item: { id: number }) {
  openDetail(item.id)
}

const decisionDialogRef = ref<InstanceType<typeof ApproveRejectDialog> | null>(null)
const decisionType = ref<DecisionType>('APPROVE')
const decisionRecord = ref<{ id: number; title: string; subtitle: string } | null>(null)

const { data: rejectionReasons } = useQuery({
  queryKey: ['requestRejectionReasons', 'selector', 'contracts'],
  queryFn: getRejectionReasonOptionsAction,
  enabled: computed(() => decisionType.value === 'REJECT'),
})

function askDecision(
  item: { id: number; typeName: string; costCenterCode: string; projectName: string },
  type: DecisionType,
) {
  decisionType.value = type
  decisionRecord.value = {
    id: item.id,
    title: item.typeName,
    subtitle: `${item.costCenterCode} · ${item.projectName}`,
  }
  clearBackendErrors()
  decisionDialogRef.value?.open()
}

interface DecisionVariables {
  type: DecisionType
  id: number
  form: RequestDecisionForm
}

const decisionMutation = useMutation({
  mutationFn: ({ type, id, form }: DecisionVariables) =>
    type === 'REJECT' ? rejectRequestAction(id, form) : approveRequestAction(id),
  onSuccess: (_data, { type }) => {
    queryClient.invalidateQueries({ queryKey: ['requests'] })
    decisionDialogRef.value?.close()
    toastDecided(type, messages.request)
  },
  onError: (error: unknown) => {
    if (!setFromError(error)) toastFailed(messages.request)
  },
})

function confirmDecision(form: RequestDecisionForm) {
  if (!decisionRecord.value) return
  clearBackendErrors()
  decisionMutation.mutate({ type: decisionType.value, id: decisionRecord.value.id, form })
}
</script>

<template>
  <div class="list-header mb-6">
    <div class="list-header__text">
      <h1 class="text-h5 font-weight-bold">Lista de solicitudes</h1>
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
        :class="['indicator', { 'indicator--active': isCounterActive('PENDING_APPROVAL') }]"
        role="button"
        @click="toggleCounter('PENDING_APPROVAL')"
      />
      <IndicatorCard
        :icon="mdiClockOutline"
        color="info"
        title="Por validar"
        :count="pendingValidation"
        :class="['indicator', { 'indicator--active': isCounterActive('PENDING_VALIDATION') }]"
        role="button"
        @click="toggleCounter('PENDING_VALIDATION')"
      />
    </div>
  </div>

  <ListControls
    v-model:search="searchInput"
    search-placeholder="Buscar por proyecto o centro de costo"
    :show-export="false"
    :show-new="false"
    @filter="filtersOpen = true"
  />

  <ActiveFilters
    :filters="activeFilters"
    @remove-filter="clearFilter"
    @clear-all="clearAllFilters"
  />

  <v-alert v-if="isError" type="error" variant="tonal" density="compact" class="mb-4 text-caption">
    No se pudo cargar la lista de solicitudes.
  </v-alert>

  <v-data-table-server
    v-if="!smAndDown"
    :page="query.page"
    :items-per-page="query.size"
    :headers="headers"
    :items="items"
    :items-length="totalItems"
    :loading="isPending"
  >
    <template #item.typeName="{ item }">
      <span class="link-cell" @click="viewDetail(item)">{{ item.typeName }}</span>
    </template>

    <template #item.status="{ item }">
      <v-chip size="small" variant="tonal" :color="item.statusColor">
        {{ item.status.name }}
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <ActionsMenu
        :record="item"
        :has-update-permission="false"
        :has-active-permission="false"
        :has-approve-permission="canApprove"
        :has-validate-permission="canValidate"
        @view="viewDetail(item)"
        @approve="askDecision(item, 'APPROVE')"
        @validate="askDecision(item, 'VALIDATE')"
        @reject="askDecision(item, 'REJECT')"
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
        <div class="pa-4" :class="{ 'request-block--divided': index > 0 }">
          <div class="d-flex align-center justify-space-between ga-2 mb-3">
            <div class="d-flex flex-wrap align-center ga-2">
              <span class="link-cell text-subtitle-2 font-weight-bold" @click="viewDetail(item)">{{
                item.typeName
              }}</span>
              <v-chip size="small" variant="tonal" :color="item.statusColor">
                {{ item.status.name }}
              </v-chip>
            </div>
            <ActionsMenu
              :record="item"
              :has-update-permission="false"
              :has-active-permission="false"
              :has-approve-permission="canApprove"
              :has-validate-permission="canValidate"
              @view="viewDetail(item)"
              @approve="askDecision(item, 'APPROVE')"
              @validate="askDecision(item, 'VALIDATE')"
              @reject="askDecision(item, 'REJECT')"
            />
          </div>

          <dl class="request-block__fields">
            <div class="request-block__field">
              <dt>CC</dt>
              <dd>{{ item.costCenterCode }}</dd>
            </div>
            <div class="request-block__field">
              <dt>Proyecto</dt>
              <dd>{{ item.projectName }}</dd>
            </div>
            <div class="request-block__field">
              <dt>Creación</dt>
              <dd>{{ item.createdAt }}</dd>
            </div>
            <div class="request-block__field">
              <dt>Solicitante</dt>
              <dd>{{ item.requesterName }}</dd>
            </div>
          </dl>
        </div>
      </template>

      <AlertComponent
        v-if="!items.length && !isError"
        type="info"
        message="No hay solicitudes que coincidan con los filtros aplicados."
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

  <RequestDetailDrawer
    v-model:open="detailDrawerOpen"
    :request="selectedRequest ?? null"
    :loading="detailLoading"
    :has-approve-permission="canApprove"
    :has-validate-permission="canValidate"
    @approve="askDecision($event, 'APPROVE')"
    @validate="askDecision($event, 'VALIDATE')"
    @reject="askDecision($event, 'REJECT')"
  />

  <ApproveRejectDialog
    ref="decisionDialogRef"
    :type="decisionType"
    :record="decisionRecord"
    :loading="decisionMutation.isPending.value"
    :reason-options="rejectionReasons ?? []"
    :error-fields="backendErrorFields"
    @confirm="confirmDecision"
  />
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

.indicator {
  cursor: pointer;
  user-select: none;
}

.indicator--active {
  outline: 2px solid rgba(var(--v-theme-on-surface), 0.38);
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
