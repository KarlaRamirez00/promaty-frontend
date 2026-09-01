<script setup lang="ts">
import AppSidebar from './components/AppSidebar.vue'
import AppNavbar from './components/AppNavbar.vue'
import RequestsList from './components/RequestsList.vue'
import { provideSidebarRail } from './composables/useSidebarRail'

provideSidebarRail()
</script>

<template>
  <v-app>
    <AppSidebar />

    <AppNavbar
      :breadcrumbs="[
        { title: 'Solicitudes de RRHH' },
        { title: 'Lista de solicitudes', disabled: true },
      ]"
    />

    <v-main>
      <v-container fluid class="pa-4 pa-sm-6">
        <RequestsList />
      </v-container>
    </v-main>
  </v-app>
</template>

<style>
.v-list {
  --v-list-prepend-gap: 16px;
}

.v-table {
  font-variant-numeric: tabular-nums slashed-zero;
}
</style>
