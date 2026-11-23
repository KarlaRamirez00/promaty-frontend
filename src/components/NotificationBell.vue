<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import {
  mdiAlertCircleOutline,
  mdiBellOutline,
  mdiCheckCircleOutline,
  mdiClockOutline,
} from '@mdi/js'
import { getDashboardSummaryAction } from '@/actions'
import { usePendingRequestsLink } from '@/composables/usePendingRequestsLink'

const REFRESH_MS = 5 * 60 * 1000
const MAX_BADGE = 99

// Cuenta los pendientes de todos los centros de costo del usuario: un aviso no debe esconder los de otra obra.
const { data: summary } = useQuery({
  queryKey: ['dashboard', 'bell'],
  queryFn: () => getDashboardSummaryAction({}),
  staleTime: 60 * 1000,
  refetchInterval: REFRESH_MS,
})

const { goToRequests } = usePendingRequestsLink()

const pending = computed(() => summary.value?.pendingRequests ?? null)

// Solo la ve quien puede aprobar o validar: para el resto no habría nada que avisar.
const canDecide = computed(() => pending.value?.toApprove != null || pending.value?.toValidate != null)

const toApprove = computed(() => pending.value?.toApprove ?? 0)
const toValidate = computed(() => pending.value?.toValidate ?? 0)
const total = computed(() => toApprove.value + toValidate.value)
const badgeContent = computed(() => (total.value > MAX_BADGE ? `${MAX_BADGE}+` : total.value))
</script>

<template>
  <v-menu v-if="canDecide" location="bottom end">
    <template #activator="{ props: menuProps }">
      <v-btn
        icon
        variant="text"
        :aria-label="total > 0 ? `Notificaciones: ${total} pendientes` : 'Notificaciones'"
        data-testid="notification-bell"
        v-bind="menuProps"
      >
        <v-badge
          :model-value="total > 0"
          :content="badgeContent"
          color="primary"
          class="bell-badge"
          data-testid="notification-badge"
        >
          <v-icon :icon="mdiBellOutline" size="20" color="grey-darken-1" />
        </v-badge>
      </v-btn>
    </template>

    <v-list density="compact" min-width="240">
      <v-list-subheader>Pendientes</v-list-subheader>
      <v-divider class="my-1" />
      <template v-if="total > 0">
        <v-list-item
          v-if="pending?.toApprove"
          :prepend-icon="mdiAlertCircleOutline"
          title="Por aprobar"
          data-testid="notification-toApprove"
          @click="goToRequests('PENDING_APPROVAL')"
        >
          <template #append>
            <v-chip size="small" color="warning" variant="flat">{{ pending.toApprove }}</v-chip>
          </template>
        </v-list-item>
        <v-list-item
          v-if="pending?.toValidate"
          :prepend-icon="mdiClockOutline"
          title="Por validar"
          data-testid="notification-toValidate"
          @click="goToRequests('PENDING_VALIDATION')"
        >
          <template #append>
            <v-chip size="small" color="info" variant="flat">{{ pending.toValidate }}</v-chip>
          </template>
        </v-list-item>
      </template>
      <v-list-item
        v-else
        :prepend-icon="mdiCheckCircleOutline"
        title="Todo al día"
        data-testid="notification-clear"
      />
    </v-list>
  </v-menu>
</template>

<style scoped>
/* Número compacto sobre la esquina de la campana: el del tamaño por defecto tapa el ícono. */
.bell-badge :deep(.v-badge__badge) {
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  font-size: 0.5625rem;
  font-weight: 700;
  line-height: 1;
}
</style>
