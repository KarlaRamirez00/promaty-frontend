<script setup lang="ts">
import { computed } from 'vue'
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
  }>(),
  {
    placeholder: 'Seleccionar',
    range: false,
    monthPicker: false,
    error: false,
    clearable: false,
    hideDetails: false,
    minDate: null,
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

const internalValue = computed<Date | Date[] | null>({
  get() {
    if (!model.value) return props.range ? [] : null
    return Array.isArray(model.value) ? model.value.map(toDate) : toDate(model.value)
  },
  set(value) {
    if (!value || (Array.isArray(value) && !value.length)) {
      model.value = null
      return
    }
    model.value = Array.isArray(value) ? value.map(toIsoString) : toIsoString(value)
  },
})

const minDateValue = computed(() => (props.minDate ? toDate(props.minDate) : undefined))
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
    :error="error"
    :clearable="clearable"
    :hide-details="hideDetails"
    variant="outlined"
    density="comfortable"
    persistent-placeholder
    hide-actions
    prepend-icon=""
  />
</template>
