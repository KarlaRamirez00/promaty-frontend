<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useRouter } from 'vue-router'
import {
  mdiAccountLockOutline,
  mdiAccountMultipleOutline,
  mdiAlertCircleOutline,
  mdiBellOutline,
  mdiCalendarClockOutline,
  mdiCalendarOutline,
  mdiCheckCircleOutline,
  mdiClockOutline,
  mdiFileDocumentRemoveOutline,
  mdiFileSign,
} from '@mdi/js'
import { useDashboardSummary } from '@/composables/useDashboardSummary'
import { usePendingRequestsLink } from '@/composables/usePendingRequestsLink'
import { ROUTE } from '@/router/route-names'
import AlertComponent from '@/components/common/AlertComponent.vue'
import IndicatorCard from '@/components/common/IndicatorCard.vue'
import type { StaffInfoItem } from '@/types/staffInfo'

const props = defineProps<{
  projectId: number | null
}>()

const router = useRouter()
const { data: summary, isPending, isError } = useDashboardSummary(toRef(props, 'projectId'))

// Con un centro de costo elegido, las listas destino llegan ya filtradas por él.
const projectQuery = computed(() => (props.projectId ? { projectId: String(props.projectId) } : {}))

const { goToRequests } = usePendingRequestsLink(toRef(props, 'projectId'))

interface AttentionRow {
  key: string
  icon: string
  color: string
  title: string
  subtitle?: string
  count: number
  go: () => void
}

// Solo se listan los indicadores visibles para el usuario y con valor mayor a cero.
const rows = computed<AttentionRow[]>(() => {
  const data = summary.value
  if (!data) return []
  const result: AttentionRow[] = []
  const pending = data.pendingRequests
  if (pending?.toApprove) {
    result.push({
      key: 'toApprove',
      icon: mdiAlertCircleOutline,
      color: 'warning',
      title: 'Por aprobar',
      count: pending.toApprove,
      go: () => goToRequests('PENDING_APPROVAL'),
    })
  }
  if (pending?.toValidate) {
    result.push({
      key: 'toValidate',
      icon: mdiClockOutline,
      color: 'info',
      title: 'Por validar',
      count: pending.toValidate,
      go: () => goToRequests('PENDING_VALIDATION'),
    })
  }
  if (data.expiringContracts !== null && data.expiringContracts > 0) {
    result.push({
      key: 'expiring',
      icon: mdiCalendarClockOutline,
      color: 'warning',
      title: 'Contratos por vencer',
      subtitle: data.expiringContractsDays
        ? `En los próximos ${data.expiringContractsDays} días`
        : undefined,
      count: data.expiringContracts,
      go: () =>
        void router.push({
          name: ROUTE.CONTRACT_LIST,
          query: { ...projectQuery.value, expiringSoon: 'true' },
        }),
    })
  }
  return result
})

const hasAnyAttentionIndicator = computed(
  () => summary.value?.pendingRequests != null || summary.value?.expiringContracts != null,
)

const monthItems = computed<StaffInfoItem[]>(() => {
  const data = summary.value
  if (!data) return []
  const items: StaffInfoItem[] = []
  const add = (icon: string, label: string, value: number | null) => {
    if (value !== null) items.push({ icon, label, value: String(value) })
  }
  add(mdiFileSign, 'Ingresos este mes', data.hiresThisMonth)
  add(mdiFileSign, 'Ingresos el próximo mes', data.hiresNextMonth)
  add(mdiFileDocumentRemoveOutline, 'Finiquitos este mes', data.terminationsThisMonth)
  add(mdiAccountMultipleOutline, 'Colaboradores activos', data.activeStaff)
  add(mdiAccountLockOutline, 'Colaboradores bloqueados', data.blockedStaff)
  return items
})
</script>

<template>
  <v-card variant="outlined" class="pa-4 pa-sm-5 h-100" data-testid="attention-panel">
    <v-skeleton-loader v-if="isPending" type="list-item-two-line, list-item-two-line" />
    <AlertComponent v-else-if="isError" type="error" message="No se pudo cargar el resumen." />
    <template v-else>
      <section v-if="hasAnyAttentionIndicator">
        <h2 class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold text-primary mb-3">
          <v-icon :icon="mdiBellOutline" size="22" />
          Requiere tu atención
        </h2>
        <div v-if="rows.length > 0" class="attention__indicators">
        <IndicatorCard
          v-for="row in rows"
          :key="row.key"
          :icon="row.icon"
          :color="row.color"
          :title="row.title"
          :subtitle="row.subtitle"
          :count="row.count"
          class="attention__indicator"
          role="button"
          tabindex="0"
          :data-testid="`attention-${row.key}`"
          @click="row.go()"
          @keydown.enter="row.go()"
          @keydown.space.prevent="row.go()"
        />
      </div>
        <div v-else class="d-flex align-center ga-2 text-body-2 text-medium-emphasis" data-testid="attention-clear">
          <v-icon :icon="mdiCheckCircleOutline" size="20" color="success" />
          Todo al día
        </div>
      </section>

      <section v-if="monthItems.length > 0">
        <v-divider v-if="hasAnyAttentionIndicator" class="my-4" />
        <h2 class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold text-primary mb-3">
          <v-icon :icon="mdiCalendarOutline" size="22" />
          Este mes
        </h2>
        <div class="attention__grid">
          <v-card v-for="item in monthItems" :key="item.label" variant="outlined" class="attention__tile pa-4">
            <div class="d-flex align-center ga-3">
              <v-avatar color="primary" variant="tonal" size="44">
                <v-icon :icon="item.icon" size="24" />
              </v-avatar>
              <div class="attention__text">
                <div class="text-h5 font-weight-bold">{{ item.value }}</div>
                <div class="text-body-2 text-medium-emphasis">{{ item.label }}</div>
              </div>
            </div>
          </v-card>
        </div>
      </section>
    </template>
  </v-card>
</template>

<style scoped>
.attention__indicators {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 12px;
}

.attention__indicator {
  cursor: pointer;
  user-select: none;
}

.attention__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
  gap: 12px;
}

.attention__tile {
  display: flex;
  align-items: center;
}

.attention__text {
  min-width: 0;
  overflow-wrap: anywhere;
}
</style>
