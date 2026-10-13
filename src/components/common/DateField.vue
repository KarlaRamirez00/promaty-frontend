<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { mdiCalendarOutline } from '@mdi/js'
import { VDateInput } from 'vuetify/labs/VDateInput'

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
    minDate?: string | null
    maxDate?: string | null
    density?: 'default' | 'comfortable' | 'compact'
  }>(),
  {
    placeholder: 'Seleccionar',
    range: false,
    monthPicker: false,
    error: false,
    clearable: false,
    hideDetails: false,
    minDate: null,
    maxDate: null,
    density: 'comfortable',
  },
)

const model = defineModel<DateFieldValue>({ default: null })

// VDateInput no acepta un patrón tipo "dd/MM/yyyy" en display-format — solo nombres de preset
// del adaptador de fechas de Vuetify (ej. "keyboardDate"). Un string no reconocido cae a su
// default ({ timeZone: 'UTC', timeZoneName: 'short' }), mostrando algo como "4/2/2027, UTC".
// Se arma el texto directamente, sin depender de esos presets.
function pad(value: number): string {
  return String(value).padStart(2, '0')
}

const displayFormat = computed(() => (value: unknown) => {
  const date = value as Date
  return props.monthPicker
    ? `${pad(date.getMonth() + 1)}/${date.getFullYear()}`
    : `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
})
const viewMode = computed(() => (props.monthPicker ? 'months' : 'month'))
const multiple = computed(() => (props.range ? 'range' : false))

// El modelo público del componente sigue en string ISO (yyyy-MM-dd) para no propagar el tipo
// Date de VDateInput al resto de la app — se convierte solo en este límite.
function toDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function toIsoString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const DAY_MS = 24 * 60 * 60 * 1000

// VDateInput en modo rango trabaja con todos los días del intervalo; el modelo público solo
// guarda los extremos [desde, hasta].
function expandRange(from: Date, to: Date): Date[] {
  const days = Math.round((to.getTime() - from.getTime()) / DAY_MS)
  return Array.from({ length: days + 1 }, (_, i) => new Date(from.getFullYear(), from.getMonth(), from.getDate() + i))
}

// En modo rango el primer clic llega como un rango de un solo día: se retiene hasta que el usuario
// elija el segundo extremo, para no emitir (ni filtrar) con un rango incompleto.
const pendingStart = ref<Date | null>(null)

// En modo rango VDateInput no cierra el menú solo; se cierra al quedar el rango completo.
const menu = ref(false)

const internalValue = computed<Date | Date[] | null>({
  get() {
    if (pendingStart.value) return [pendingStart.value]
    if (!model.value) return props.range ? [] : null
    if (!Array.isArray(model.value)) return toDate(model.value)
    const dates = model.value.map(toDate)
    return dates.length > 1 ? expandRange(dates[0], dates[dates.length - 1]) : dates
  },
  set(value) {
    if (!value || (Array.isArray(value) && !value.length)) {
      pendingStart.value = null
      model.value = null
      return
    }
    if (!Array.isArray(value)) {
      model.value = toIsoString(value)
      return
    }
    const sorted = [...value].sort((a, b) => a.getTime() - b.getTime())
    if (sorted.length === 1) {
      const isSameDayTwice = pendingStart.value?.getTime() === sorted[0].getTime()
      if (!isSameDayTwice) {
        pendingStart.value = sorted[0]
        return
      }
    }
    pendingStart.value = null
    const first = toIsoString(sorted[0])
    const last = toIsoString(sorted[sorted.length - 1])
    model.value = [first, last]
    menu.value = false
  },
})

const minDateValue = computed(() => (props.minDate ? toDate(props.minDate) : undefined))
const maxDateValue = computed(() => (props.maxDate ? toDate(props.maxDate) : undefined))

// Con una fecha máxima en el pasado el calendario abriría en un mes deshabilitado: parte en la fecha
// elegida o, si no hay, en la máxima. Sin fecha máxima no se controla la vista.
const viewYear = ref<number>()
const viewMonth = ref<number>()

function syncView(value: DateFieldValue) {
  const anchor = typeof value === 'string' ? toDate(value) : maxDateValue.value
  viewYear.value = anchor?.getFullYear()
  viewMonth.value = anchor?.getMonth()
}

watch(model, syncView, { immediate: true })

const viewBindings = computed(() =>
  maxDateValue.value
    ? {
        year: viewYear.value,
        month: viewMonth.value,
        'onUpdate:year': (value: number) => (viewYear.value = value),
        'onUpdate:month': (value: number) => (viewMonth.value = value),
      }
    : {},
)
</script>

<template>
  <VDateInput
    v-model="internalValue"
    :label="label"
    :placeholder="placeholder"
    :multiple="multiple"
    :view-mode="viewMode"
    :display-format="displayFormat"
    :min="minDateValue"
    :max="maxDateValue"
    v-bind="viewBindings"
    v-model:menu="menu"
    class="date-field"
    :prepend-inner-icon="mdiCalendarOutline"
    :error="error"
    :clearable="clearable"
    :hide-details="hideDetails"
    variant="outlined"
    :density="density"
    persistent-placeholder
    hide-actions
    prepend-icon=""
  />
</template>
