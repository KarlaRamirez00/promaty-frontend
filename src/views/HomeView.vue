<script setup lang="ts">
import { computed, ref } from 'vue'
import { mdiHandWaveOutline } from '@mdi/js'
import { useAuthStore } from '@/stores'
import { useCostCenterScope } from '@/composables/useCostCenterScope'
import { useDashboardSummary } from '@/composables/useDashboardSummary'
import { useFillViewport } from '@/composables/useFillViewport'
import HomeGreetingBanner from '@/components/home/HomeGreetingBanner.vue'
import BirthdayList from '@/components/home/BirthdayList.vue'
import AttentionPanel from '@/components/home/AttentionPanel.vue'

const auth = useAuthStore()
const canSeeBirthdays = computed(() => auth.permissions.includes('staff.read'))

const grid = ref<HTMLElement | null>(null)
useFillViewport(grid)

const { costCenters, projectId, showSelector, ready } = useCostCenterScope()

const { data: summary, isPending, isError } = useDashboardSummary(projectId, ready)

// Las cifras de "Este mes" solas no justifican un dashboard: hace falta algo accionable o cumpleaños.
const hasAttentionIndicator = computed(
  () => summary.value?.pendingRequests != null || summary.value?.expiringContracts != null,
)

// Si el resumen falla no se vuelve a la bienvenida: el usuario debe ver el aviso y poder reintentar.
const showWelcome = computed(
  () =>
    ready.value &&
    !isPending.value &&
    !isError.value &&
    !hasAttentionIndicator.value &&
    !canSeeBirthdays.value,
)
</script>

<template>
  <div
    v-if="showWelcome"
    class="d-flex flex-column align-center justify-center text-center pa-8"
    style="min-height: 60vh"
  >
    <v-icon :icon="mdiHandWaveOutline" size="64" color="primary" class="mb-4" />
    <p v-if="auth.userName" class="text-medium-emphasis mb-1 home-greeting-name">{{ auth.userName }}</p>
    <h1 class="text-h4 font-weight-bold mb-2">Te damos la bienvenida a Promaty</h1>
    <p class="text-body-1 text-medium-emphasis">Usa el menú principal para gestionar tus solicitudes.</p>
  </div>

  <template v-else>
    <HomeGreetingBanner
      v-model:project-id="projectId"
      :cost-centers="costCenters ?? []"
      :show-selector="showSelector"
      class="mb-4"
    />

    <div ref="grid" :class="['home-grid', { 'home-grid--with-birthdays': canSeeBirthdays }]">
      <template v-if="ready">
        <BirthdayList v-if="canSeeBirthdays" :project-id="projectId" />
        <AttentionPanel :project-id="projectId" />
      </template>
      <v-skeleton-loader v-else type="card" />
    </div>
  </template>
</template>

<style scoped>
.home-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}

@media (min-width: 960px) {
  .home-grid--with-birthdays {
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  }
}

.home-greeting-name {
  font-style: italic;
  font-size: 1rem;
}
</style>
