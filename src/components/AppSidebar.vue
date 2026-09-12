<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  mdiAccountGroup,
  mdiAccountMultipleOutline,
  mdiAccountSearchOutline,
  mdiCalendarAccountOutline,
  mdiCalendarClockOutline,
  mdiCashClock,
  mdiCashMultiple,
  mdiClipboardTextOutline,
  mdiDomain,
  mdiFileDocumentRemoveOutline,
  mdiFilePlusOutline,
  mdiFileSign,
  mdiMedicalBag,
  mdiOfficeBuildingCogOutline,
  mdiShapeOutline,
  mdiSwapHorizontal,
  mdiToolboxOutline,
} from '@mdi/js'
import { useSidebarRail } from '@/composables/useSidebarRail'
import PromatyLogo from '@/components/PromatyLogo.vue'

const { rail, open, mobile } = useSidebarRail()
const route = useRoute()

const isRail = computed(() => !mobile.value && rail.value)

const opened = ref(['rrhh', 'mantenedores'])

const rrhhItems = [
  { title: 'Solicitudes', icon: mdiClipboardTextOutline, to: '/requests' },
  { title: 'Anexos', icon: mdiFilePlusOutline },
  { title: 'Anticipos', icon: mdiCashClock },
  { title: 'Colaboradores', icon: mdiAccountMultipleOutline },
  { title: 'Contratos', icon: mdiFileSign },
  { title: 'Control de asistencia', icon: mdiCalendarClockOutline },
  { title: 'Finiquitos', icon: mdiFileDocumentRemoveOutline },
  { title: 'Licencias Médicas', icon: mdiMedicalBag },
  { title: 'Permisos', icon: mdiCalendarAccountOutline },
  { title: 'Reclutamiento', icon: mdiAccountSearchOutline },
  { title: 'Sueldos', icon: mdiCashMultiple },
  { title: 'Traspasos', icon: mdiSwapHorizontal },
]

const maintainerItems = [
  { title: 'Mandantes', icon: mdiDomain, to: '/clients' },
  { title: 'Tipos de proyecto', icon: mdiShapeOutline, to: '/project-types' },
  { title: 'Especialidades', icon: mdiToolboxOutline, to: '/project-specialties' },
]

function isActive(item: { to?: string }) {
  return !!item.to && route.path === item.to
}

function expandFromRail() {
  rail.value = false
}

function selectItem() {
  if (mobile.value) open.value = false
}
</script>

<template>
  <v-navigation-drawer
    v-model="open"
    :rail="!mobile && rail"
    :permanent="!mobile"
    :temporary="mobile"
    width="260"
    rail-width="72"
  >
    <div class="d-flex align-center py-4" :class="isRail ? 'justify-center' : 'px-4'">
      <PromatyLogo :icon-only="isRail" />
    </div>

    <v-list v-if="isRail" density="compact" nav>
      <v-menu open-on-hover :open-on-click="false" location="end">
        <template #activator="{ props }">
          <v-list-item v-bind="props" :prepend-icon="mdiAccountGroup" @click="expandFromRail" />
        </template>

        <v-list density="compact" nav min-width="220">
          <v-list-item
            v-for="item in rrhhItems"
            :key="item.title"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            :active="isActive(item)"
            :color="isActive(item) ? 'primary' : undefined"
            @click="selectItem"
          />
        </v-list>
      </v-menu>

      <v-menu open-on-hover :open-on-click="false" location="end">
        <template #activator="{ props }">
          <v-list-item v-bind="props" :prepend-icon="mdiOfficeBuildingCogOutline" @click="expandFromRail" />
        </template>

        <v-list density="compact" nav min-width="220">
          <v-list-item
            v-for="item in maintainerItems"
            :key="item.title"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            :active="isActive(item)"
            :color="isActive(item) ? 'primary' : undefined"
            @click="selectItem"
          />
        </v-list>
      </v-menu>
    </v-list>

    <v-list v-else v-model:opened="opened" density="compact" nav>
      <v-list-group value="rrhh">
        <template #activator="{ props }">
          <v-list-item v-bind="props" :prepend-icon="mdiAccountGroup" title="RRHH" />
        </template>

        <v-list-item
          v-for="item in rrhhItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :active="isActive(item)"
          :variant="isActive(item) ? 'flat' : 'text'"
          :color="isActive(item) ? 'primary' : undefined"
          @click="selectItem"
        />
      </v-list-group>

      <v-list-group value="mantenedores">
        <template #activator="{ props }">
          <v-list-item v-bind="props" :prepend-icon="mdiOfficeBuildingCogOutline" title="Mantenedores" />
        </template>

        <v-list-item
          v-for="item in maintainerItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :active="isActive(item)"
          :variant="isActive(item) ? 'flat' : 'text'"
          :color="isActive(item) ? 'primary' : undefined"
          @click="selectItem"
        />
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>
