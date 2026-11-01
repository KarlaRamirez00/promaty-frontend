<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { mdiCogOutline, mdiFileSign } from '@mdi/js'
import { getSettingListAction } from '@/actions'
import { usePermissions } from '@/composables/usePermissions'
import SettingItem from '@/components/SettingItem.vue'

const GROUP_ICONS: Record<string, string> = {
  CONTRACTS: mdiFileSign,
}

const { hasPermission } = usePermissions()
const canUpdate = computed(() => hasPermission('update'))

const {
  data: groups,
  isPending,
  isError,
} = useQuery({
  queryKey: ['settings'],
  queryFn: getSettingListAction,
})
</script>

<template>
  <div class="mb-6">
    <h1 class="text-h5 font-weight-bold">Configuración</h1>
    <p class="text-body-2 text-medium-emphasis mt-1">
      Parámetros que ajustan el comportamiento del sistema.
    </p>
  </div>

  <v-alert v-if="isError" type="error" variant="tonal" density="compact" class="mb-4 text-caption">
    No se pudo cargar la configuración.
  </v-alert>

  <v-progress-linear v-if="isPending" indeterminate color="primary" class="mb-4" />

  <section v-for="group in groups" :key="group.key" class="mb-6">
    <h2 class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold text-primary mb-3">
      <v-icon :icon="GROUP_ICONS[group.key] ?? mdiCogOutline" size="22" />
      {{ group.label }}
    </h2>
    <div class="d-flex flex-column ga-4">
      <SettingItem
        v-for="setting in group.settings"
        :key="setting.key"
        :setting="setting"
        :editable="canUpdate"
      />
    </div>
  </section>
</template>
