<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { es } from 'date-fns/locale'
import { mdiCalendarBlankOutline, mdiClose } from '@mdi/js'

// Renderiza el input vía #dp-input como un v-text-field para que se vea igual al resto del
// formulario, dejando que la librería resuelva la apertura del calendario (sin @click propio).

export type DateFieldValue = string | string[] | null

const props = withDefaults(
  defineProps<{
    label: string
    placeholder?: string
    range?: boolean
    monthPicker?: boolean
    error?: boolean
    clearable?: boolean
    hideDetails?: boolean
  }>(),
  {
    placeholder: 'Seleccionar',
    range: false,
    monthPicker: false,
    error: false,
    clearable: false,
    hideDetails: false,
  },
)

const model = defineModel<DateFieldValue>({ default: null })

const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)

const modelType = computed(() => (props.monthPicker ? 'yyyy-MM' : 'yyyy-MM-dd'))
const displayFormat = computed(() => (props.monthPicker ? 'MM/yyyy' : 'dd/MM/yyyy'))

function clear(event: MouseEvent) {
  event.stopPropagation()
  model.value = null
}
</script>

<template>
  <VueDatePicker
    v-model="model"
    :range="range"
    :month-picker="monthPicker"
    :model-type="modelType"
    :format="displayFormat"
    :locale="es"
    :week-start="1"
    six-weeks
    :time-config="{ enableTimePicker: false }"
    :dark="isDark"
    teleport="body"
    auto-apply
  >
    <template #dp-input="{ value }">
      <v-text-field
        :model-value="value"
        :label="label"
        :placeholder="placeholder"
        variant="outlined"
        density="comfortable"
        readonly
        persistent-placeholder
        :error="error"
        :hide-details="hideDetails"
        :append-inner-icon="clearable && model ? mdiClose : mdiCalendarBlankOutline"
        @click:append-inner="clearable && model ? clear($event) : undefined"
      />
    </template>
  </VueDatePicker>
</template>

<style scoped>
/* La librería envuelve el slot en sus propios contenedores para adjuntar el click de apertura —
   display: contents los saca del flujo de caja sin perder ese click delegado. */
:deep(.dp--main),
:deep(.dp--input-wrap) {
  display: contents;
}

/* .dp--input-wrap trae box-sizing: unset (resuelve a content-box), lo que rompe la herencia
   border-box que Vuetify espera en su jerarquía interna y sumaba padding extra a la altura. */
:deep(.dp--input-wrap) {
  box-sizing: border-box;
}
</style>
