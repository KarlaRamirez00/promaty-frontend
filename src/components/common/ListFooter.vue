<script setup lang="ts">
import { computed } from 'vue'
import { mdiChevronLeft, mdiChevronRight, mdiFormatListBulleted } from '@mdi/js'

const props = withDefaults(
  defineProps<{
    total: number
    pageCount: number
    pageSizes?: number[]
  }>(),
  { pageSizes: () => [10, 25, 50, 100] },
)

const page = defineModel<number>('page', { required: true })
const size = defineModel<number>('size', { required: true })

const lastPage = computed(() => Math.max(1, props.pageCount))

function changeSize(value: number) {
  size.value = value
  page.value = 1
}
</script>

<template>
  <div class="list-footer d-flex flex-wrap align-center justify-space-between ga-4 py-2 px-2">
    <div class="d-flex align-center ga-2 text-medium-emphasis">
      <v-icon :icon="mdiFormatListBulleted" size="20" />
      <span>
        <strong class="text-high-emphasis">{{ total }}</strong>
        {{ total === 1 ? 'Registro' : 'Registros' }}
      </span>
    </div>

    <div class="d-flex align-center ga-2">
      <v-select
        :model-value="size"
        :items="pageSizes"
        variant="outlined"
        density="compact"
        hide-details
        class="list-footer__size"
        @update:model-value="changeSize"
      />

      <v-btn
        :icon="mdiChevronLeft"
        variant="text"
        density="comfortable"
        :disabled="page <= 1"
        aria-label="Página anterior"
        @click="page--"
      />

      <div class="list-footer__page">{{ page }}</div>

      <span class="text-medium-emphasis text-no-wrap">
        de {{ lastPage }} {{ lastPage === 1 ? 'página' : 'páginas' }}
      </span>

      <v-btn
        :icon="mdiChevronRight"
        variant="text"
        density="comfortable"
        :disabled="page >= lastPage"
        aria-label="Página siguiente"
        @click="page++"
      />
    </div>
  </div>
</template>

<style scoped>
.list-footer__size {
  width: 100px;
}

.list-footer__page {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: thin solid rgba(var(--v-theme-on-surface), 0.23);
  border-radius: 4px;
  font-size: 0.875rem;
}
</style>
