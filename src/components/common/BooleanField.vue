<script setup lang="ts">
defineProps<{
  label: string
}>()

const model = defineModel<boolean>({ default: false })
</script>

<template>
  <div class="boolean-field">
    <span class="boolean-field__label">{{ label }}</span>
    <v-sheet rounded class="boolean-field__control d-flex align-center justify-space-between px-4" min-height="50">
      <span class="text-body-2 text-medium-emphasis">{{ model ? 'Sí' : 'No' }}</span>
      <v-switch v-model="model" color="primary" density="compact" hide-details :aria-label="label" />
    </v-sheet>
  </div>
</template>

<style scoped>
.boolean-field {
  position: relative;
}

.boolean-field__label {
  position: absolute;
  top: -8px;
  left: 12px;
  z-index: 1;
  padding: 0 4px;
  background: rgb(var(--v-theme-surface));
  font-size: 12px;
  line-height: 1;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.boolean-field__control {
  border: thin solid rgba(var(--v-theme-on-surface), 0.38);
}
</style>
