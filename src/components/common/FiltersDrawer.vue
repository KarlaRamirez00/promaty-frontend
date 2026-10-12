<script setup lang="ts">
import { ref, watch } from 'vue'
import { mdiChevronRight, mdiTuneVariant } from '@mdi/js'
import DetailDrawer from '@/components/common/DetailDrawer.vue'
import DateField, { type DateFieldValue } from '@/components/common/DateField.vue'

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

const open = defineModel<boolean>('open', { default: false })
const values = defineModel<Record<string, unknown>>('values', { default: () => ({}) })

const emit = defineEmits<{
  clear: []
}>()

// Los cambios se acumulan en un borrador y solo se aplican al pulsar "Aplicar".
const draft = ref<Record<string, unknown>>({ ...values.value })

watch(open, (isOpen) => {
  if (isOpen) draft.value = { ...values.value }
})

function setValue(key: string, value: unknown) {
  draft.value = { ...draft.value, [key]: value }
}

function dateValue(key: string): DateFieldValue {
  return draft.value[key] as DateFieldValue
}

function apply() {
  values.value = { ...draft.value }
  open.value = false
}

function clear() {
  draft.value = Object.fromEntries(props.fields.map((field) => [field.key, null]))
  emit('clear')
}
</script>

<template>
  <DetailDrawer v-model:open="open" width="340">
    <template #header>
      <div class="d-flex ga-3">
        <button
          type="button"
          class="detail-drawer__icon-box flex-shrink-0"
          aria-label="Cerrar filtros"
          @click="open = false"
        >
          <v-icon :icon="mdiChevronRight" size="20" />
        </button>
        <div class="d-flex align-center ga-2">
          <v-icon :icon="mdiTuneVariant" size="20" />
          <span class="text-h6 font-weight-bold">Filtros</span>
        </div>
      </div>
    </template>

    <div class="d-flex flex-column ga-4">
      <div v-for="field in props.fields" :key="field.key">
        <div class="text-caption text-medium-emphasis mb-1">{{ field.label }}</div>

        <v-select
          v-if="field.type === 'select'"
          :model-value="draft[field.key]"
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
          :model-value="draft[field.key]"
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
          :model-value="draft[field.key]"
          color="primary"
          density="compact"
          hide-details
          @update:model-value="setValue(field.key, $event)"
        />

        <DateField
          v-else-if="field.type === 'date'"
          :model-value="dateValue(field.key)"
          :range="field.range ?? false"
          :month-picker="field.mode === 'month'"
          label=""
          density="compact"
          clearable
          hide-details
          @update:model-value="setValue(field.key, $event)"
        />
      </div>
    </div>

    <template #actions>
      <v-btn variant="text" block @click="clear">Limpiar</v-btn>
      <v-btn color="primary" variant="flat" block @click="apply">Aplicar</v-btn>
    </template>
  </DetailDrawer>
</template>
