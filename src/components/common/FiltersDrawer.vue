<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { es } from 'date-fns/locale'
import { mdiTuneVariant } from '@mdi/js'
import DetailDrawer from '@/components/common/DetailDrawer.vue'

export interface FilterOption {
  title: string
  value: unknown
}

export type FilterField =
  | { key: string; type: 'select'; label: string; options: FilterOption[] | string[]; placeholder?: string }
  | { key: string; type: 'autocomplete'; label: string; options: FilterOption[] | string[]; placeholder?: string }
  | { key: string; type: 'date'; label: string; mode?: 'day' | 'month'; range?: boolean }
  | { key: string; type: 'boolean'; label: string }

const props = defineProps<{
  fields: FilterField[]
}>()

const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)

const open = defineModel<boolean>('open', { default: false })
const values = defineModel<Record<string, unknown>>('values', { default: () => ({}) })

const emit = defineEmits<{
  clear: []
}>()

function setValue(key: string, value: unknown) {
  values.value = { ...values.value, [key]: value }
}

type DateFieldValue = string | string[] | null

function dateValue(key: string): DateFieldValue {
  return values.value[key] as DateFieldValue
}
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
      <div v-for="field in props.fields" :key="field.key">
        <div class="text-caption text-medium-emphasis mb-1">{{ field.label }}</div>

        <v-select
          v-if="field.type === 'select'"
          :model-value="values[field.key]"
          :items="field.options"
          item-title="title"
          item-value="value"
          :placeholder="field.placeholder ?? 'Seleccionar'"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          @update:model-value="setValue(field.key, $event)"
        />

        <v-autocomplete
          v-else-if="field.type === 'autocomplete'"
          :model-value="values[field.key]"
          :items="field.options"
          item-title="title"
          item-value="value"
          :placeholder="field.placeholder ?? 'Buscar'"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          @update:model-value="setValue(field.key, $event)"
        />

        <v-switch
          v-else-if="field.type === 'boolean'"
          :model-value="values[field.key]"
          color="primary"
          density="compact"
          hide-details
          @update:model-value="setValue(field.key, $event)"
        />

        <VueDatePicker
          v-else-if="field.type === 'date'"
          :model-value="dateValue(field.key)"
          :range="field.range ?? false"
          :month-picker="field.mode === 'month'"
          :model-type="field.mode === 'month' ? 'yyyy-MM' : 'yyyy-MM-dd'"
          :format="field.mode === 'month' ? 'MM/yyyy' : 'dd/MM/yyyy'"
          :locale="es"
          :week-start="1"
          six-weeks
          :time-config="{ enableTimePicker: false }"
          :dark="isDark"
          teleport="body"
          auto-apply
          placeholder="Seleccionar"
          @update:model-value="setValue(field.key, $event)"
        />
      </div>
    </div>

    <template #actions>
      <v-btn variant="text" block @click="emit('clear')">Limpiar</v-btn>
      <v-btn color="primary" variant="flat" block @click="open = false">Filtrar contenido</v-btn>
    </template>
  </DetailDrawer>
</template>
