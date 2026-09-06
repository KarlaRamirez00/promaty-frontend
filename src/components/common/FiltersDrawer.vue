<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { es } from 'date-fns/locale'
import { mdiTuneVariant } from '@mdi/js'
import type { RequestStatus } from '@/types/request'
import DetailDrawer from '@/components/common/DetailDrawer.vue'

const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)

defineProps<{
  ccOptions: string[]
  requesterOptions: string[]
}>()

const open = defineModel<boolean>('open', { default: false })
const status = defineModel<RequestStatus | null>('status', { default: null })
const cc = defineModel<string | null>('cc', { default: null })
const requester = defineModel<string | null>('requester', { default: null })
const dateFrom = defineModel<string | null>('dateFrom', { default: null })
const dateTo = defineModel<string | null>('dateTo', { default: null })

const emit = defineEmits<{
  clear: []
}>()

const statusOptions: RequestStatus[] = [
  'Pendiente aprobación',
  'Pendiente validación',
  'Aprobado',
  'Rechazado',
]
</script>

<template>
  <DetailDrawer v-model:open="open" width="340">
    <template #header>
      <div class="d-flex align-center ga-2">
        <v-icon :icon="mdiTuneVariant" size="20" />
        <span class="text-h6 font-weight-bold">Filtros</span>
      </div>
    </template>

    <div class="d-flex flex-column ga-4">
      <div>
        <div class="text-caption text-medium-emphasis mb-1">Estado</div>
        <v-select
          v-model="status"
          :items="statusOptions"
          placeholder="Seleccionar"
          variant="outlined"
          density="compact"
          clearable
          hide-details
        />
      </div>

      <div>
        <div class="text-caption text-medium-emphasis mb-1">Centro de costo</div>
        <v-select
          v-model="cc"
          :items="ccOptions"
          placeholder="Seleccionar"
          variant="outlined"
          density="compact"
          clearable
          hide-details
        />
      </div>

      <div>
        <div class="text-caption text-medium-emphasis mb-1">Solicitante</div>
        <v-autocomplete
          v-model="requester"
          :items="requesterOptions"
          placeholder="Buscar"
          variant="outlined"
          density="compact"
          clearable
          hide-details
        />
      </div>

      <div>
        <div class="text-caption text-medium-emphasis mb-1">Fecha desde</div>
        <VueDatePicker
          v-model="dateFrom"
          model-type="yyyy-MM-dd"
          format="dd/MM/yyyy"
          :locale="es"
          :week-start="1"
          six-weeks
          :time-config="{ enableTimePicker: false }"
          :dark="isDark"
          teleport="body"
          auto-apply
          placeholder="Seleccionar fecha"
        />
      </div>

      <div>
        <div class="text-caption text-medium-emphasis mb-1">Fecha hasta</div>
        <VueDatePicker
          v-model="dateTo"
          model-type="yyyy-MM-dd"
          format="dd/MM/yyyy"
          :locale="es"
          :week-start="1"
          six-weeks
          :time-config="{ enableTimePicker: false }"
          :dark="isDark"
          teleport="body"
          auto-apply
          placeholder="Seleccionar fecha"
        />
      </div>
    </div>

    <template #actions>
      <v-btn variant="text" block @click="emit('clear')">Limpiar</v-btn>
      <v-btn color="primary" variant="flat" block @click="open = false">Filtrar contenido</v-btn>
    </template>
  </DetailDrawer>
</template>

