<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { mdiAccountCircleOutline, mdiCakeVariantOutline, mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { getDashboardBirthdaysAction } from '@/actions'
import AlertComponent from '@/components/common/AlertComponent.vue'

const props = defineProps<{
  projectId: number | null
}>()

const MONTH_FORMAT = new Intl.DateTimeFormat('es-CL', { month: 'long' })

const month = ref(new Date().getMonth() + 1)

const monthLabel = computed(() => MONTH_FORMAT.format(new Date(2000, month.value - 1, 1)))

const { data, isPending, isError } = useQuery({
  queryKey: computed(() => ['dashboard', 'birthdays', props.projectId, month.value]),
  queryFn: () => getDashboardBirthdaysAction({ projectId: props.projectId, month: month.value }),
})

// Solo se muestran personas del mes elegido, aunque la respuesta traiga otro mes.
const birthdays = computed(() => (data.value ?? []).filter((item) => item.month === month.value))

function shiftMonth(step: number) {
  month.value = ((month.value - 1 + step + 12) % 12) + 1
}
</script>

<template>
  <v-card variant="outlined" class="pa-4 pa-sm-5 d-flex flex-column h-100" data-testid="birthday-list">
    <h2 class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold text-primary">
      <v-icon :icon="mdiCakeVariantOutline" size="22" />
      Cumpleaños del mes
    </h2>

    <div class="d-flex align-center justify-space-between mt-2">
      <v-btn
        :icon="mdiChevronLeft"
        variant="text"
        density="comfortable"
        aria-label="Mes anterior"
        data-testid="birthday-prev"
        @click="shiftMonth(-1)"
      />
      <span class="text-body-2 font-weight-bold text-capitalize">{{ monthLabel }}</span>
      <v-btn
        :icon="mdiChevronRight"
        variant="text"
        density="comfortable"
        aria-label="Mes siguiente"
        data-testid="birthday-next"
        @click="shiftMonth(1)"
      />
    </div>

    <v-divider class="my-2" />

    <div class="birthday-body">
      <div class="birthday-scroll">
      <v-skeleton-loader v-if="isPending" type="list-item-avatar-two-line@3" />
      <AlertComponent v-else-if="isError" type="error" message="No se pudieron cargar los cumpleaños." />
      <p v-else-if="birthdays.length === 0" class="text-body-2 text-medium-emphasis text-center py-6">
        Sin cumpleaños este mes
      </p>
      <template v-else>
        <div
          v-for="item in birthdays"
          :key="item.staffId"
          class="d-flex align-center ga-3 py-2"
          data-testid="birthday-item"
        >
          <v-avatar color="primary" variant="tonal" size="44">
            <v-icon :icon="mdiAccountCircleOutline" size="28" />
          </v-avatar>
          <div class="birthday__text flex-grow-1">
            <div class="text-subtitle-1 font-weight-bold">{{ item.fullName }}</div>
            <div class="text-body-2 text-medium-emphasis text-capitalize">{{ item.dayLabel }}</div>
          </div>
          <v-chip v-if="item.isToday" color="primary" size="small" variant="tonal">Hoy</v-chip>
        </div>
      </template>
      </div>
    </div>
  </v-card>
</template>

<style scoped>
/* La lista ocupa el alto sobrante y hace scroll por dentro: la tarjeta iguala a la de al lado. */
.birthday-body {
  position: relative;
  flex: 1 1 0;
  min-height: 240px;
}

.birthday-scroll {
  position: absolute;
  inset: 0;
  overflow-y: auto;
}

/* Los nombres largos hacen salto de línea: el usuario necesita leerlos completos. */
.birthday__text {
  min-width: 0;
  overflow-wrap: anywhere;
}
</style>
