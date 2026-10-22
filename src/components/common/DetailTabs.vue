<script setup lang="ts">
import { ref } from 'vue'
import type { DetailSection } from '@/types/detail'
import DetailFieldList from '@/components/common/DetailFieldList.vue'

const props = defineProps<{
  sections: DetailSection[]
}>()

const activeTab = ref(props.sections[0]?.key)
</script>

<template>
  <v-tabs v-model="activeTab" color="primary" density="comfortable" show-arrows>
    <v-tab v-for="section in sections" :key="section.key" :value="section.key" class="text-none">
      {{ section.tab }}
    </v-tab>
  </v-tabs>

  <v-tabs-window v-model="activeTab" class="mt-4">
    <v-tabs-window-item v-for="section in sections" :key="section.key" :value="section.key">
      <h3 class="detail-tabs__title">{{ section.title }}</h3>
      <DetailFieldList :items="section.fields" />
      <slot :name="section.key" />
    </v-tabs-window-item>
  </v-tabs-window>
</template>

<style scoped>
.detail-tabs__title {
  margin: 0 0 8px;
  padding: 0 8px;
  font-size: 1rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}
</style>
