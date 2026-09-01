<script setup lang="ts">
defineProps<{
  icon: string
  color: string
  title: string
  subtitle?: string
  count: number | string
}>()
</script>

<template>
  <v-card variant="tonal" :color="color" height="100%">
    <v-card-text class="d-flex align-center justify-space-between ga-3 py-4">
      <div class="d-flex align-center ga-3">
        <v-icon :icon="icon" size="28" />
        <div>
          <div class="text-subtitle-2 font-weight-bold">{{ title }}</div>
          <div v-if="subtitle" class="text-caption text-medium-emphasis">{{ subtitle }}</div>
        </div>
      </div>
      <v-chip :color="color" size="small" variant="flat">{{ count }}</v-chip>
    </v-card-text>
  </v-card>
</template>
