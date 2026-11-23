<script setup lang="ts">
import { mdiHandWaveOutline } from '@mdi/js'
import { useAuthStore } from '@/stores'
import { getGreeting } from '@/utils'
import type { CostCenterOption } from '@/models'

defineProps<{
  costCenters: CostCenterOption[]
  showSelector: boolean
}>()

const projectId = defineModel<number | null>('projectId', { default: null })

const auth = useAuthStore()

const today = new Intl.DateTimeFormat('es-CL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date())

</script>

<template>
  <v-card variant="outlined" class="pa-4 pa-sm-5" data-testid="home-greeting">
    <div class="d-flex flex-wrap align-center justify-space-between ga-x-6 ga-y-3">
      <div class="d-flex align-center ga-3 greeting__text">
        <v-avatar color="primary" variant="tonal" size="44">
          <v-icon :icon="mdiHandWaveOutline" size="28" />
        </v-avatar>
        <div>
          <h1 class="text-subtitle-1 font-weight-bold">
            {{ getGreeting() }}<template v-if="auth.userName">, {{ auth.userName }}</template>
          </h1>
          <div v-if="showSelector" class="text-body-2 text-medium-emphasis text-capitalize">{{ today }}</div>
        </div>
      </div>

      <v-select
        v-if="showSelector"
        v-model="projectId"
        :items="costCenters"
        item-title="title"
        item-value="id"
        label="Centro de costo"
        variant="outlined"
        density="compact"
        hide-details
        class="greeting__select"
        data-testid="home-project-select"
      />
      <span v-else class="text-body-2 text-medium-emphasis text-capitalize">{{ today }}</span>
    </div>
  </v-card>
</template>

<style scoped>
.greeting__text {
  min-width: 0;
  overflow-wrap: anywhere;
}

.greeting__select {
  flex: 0 1 320px;
  min-width: min(100%, 220px);
}
</style>
