<script setup lang="ts">
interface Field {
  key: string
  label: string
  value?: string | number
}

defineProps<{
  items: Field[]
}>()
</script>

<template>
  <dl class="detail-field-list">
    <div v-for="item in items" :key="item.key" class="detail-field-list__row">
      <dt>{{ item.label }}</dt>
      <dd>
        <slot :name="item.key" :item="item">{{ item.value }}</slot>
      </dd>
    </div>
  </dl>
</template>

<style scoped>
.detail-field-list {
  margin: 0;
}

.detail-field-list__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 8px;
}

.detail-field-list__row + .detail-field-list__row {
  border-top: thin solid rgba(var(--v-theme-on-surface), 0.12);
}

.detail-field-list__row dt {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.detail-field-list__row dd {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: right;
  word-break: break-word;
}
</style>
