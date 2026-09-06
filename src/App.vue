<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { mdiAlert, mdiCheckCircle, mdiCloseCircle, mdiInformation } from '@mdi/js'
import AppSidebar from '@/components/AppSidebar.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import { provideSidebarRail } from '@/composables/useSidebarRail'
import { useSnackbarStore, type ToastVariant } from '@/stores/snackbar'

provideSidebarRail()

const snackbar = useSnackbarStore()
const route = useRoute()
const isPublic = computed(() => route.meta.public === true)
const breadcrumbs = computed(() => route.meta.breadcrumbs ?? [])

const TOAST_ICON: Record<ToastVariant, string> = {
  success: mdiCheckCircle,
  error: mdiCloseCircle,
  warning: mdiAlert,
  info: mdiInformation,
}

const snackbarIcon = computed(() => TOAST_ICON[snackbar.current?.variant ?? 'info'])
</script>

<template>
  <v-app>
    <template v-if="isPublic">
      <v-main>
        <router-view />
      </v-main>
    </template>

    <template v-else>
      <AppSidebar />

      <AppNavbar :breadcrumbs="breadcrumbs" />

      <v-main>
        <v-container fluid class="pa-4 pa-sm-6">
          <router-view />
        </v-container>
      </v-main>
    </template>

    <v-snackbar
      :model-value="snackbar.visible"
      :color="snackbar.current?.variant"
      :timeout="4000"
      location="bottom right"
      @update:model-value="(value) => { if (!value) snackbar.dismiss() }"
    >
      <div class="d-flex align-start ga-3">
        <v-icon :icon="snackbarIcon" />
        <div>
          <div class="font-weight-medium">
            <template v-if="snackbar.current?.code">{{ snackbar.current.code }} </template>
            {{ snackbar.current?.title }}
          </div>
          <div v-if="snackbar.current?.message" class="text-body-2 mt-1">
            {{ snackbar.current.message }}
          </div>
        </div>
      </div>
    </v-snackbar>
  </v-app>
</template>

<style>
.v-list {
  --v-list-prepend-gap: 16px;
}

.v-table {
  font-variant-numeric: tabular-nums slashed-zero;
}

.v-field__clearable > .v-icon {
  font-size: 18px;
}

.link-cell {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.link-cell:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.08);
}
</style>
