<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  mdiAccountGroup,
  mdiAccountMultipleOutline,
  mdiAccountSearchOutline,
  mdiCalendarAccountOutline,
  mdiCalendarClockOutline,
  mdiCashClock,
  mdiCashMultiple,
  mdiClipboardTextOutline,
  mdiFileDocumentRemoveOutline,
  mdiFilePlusOutline,
  mdiFileSign,
  mdiMedicalBag,
  mdiSwapHorizontal,
} from '@mdi/js'
import { useSidebarRail } from '../composables/useSidebarRail'
import PromatyLogo from './PromatyLogo.vue'

const { rail, open, mobile } = useSidebarRail()

const isRail = computed(() => !mobile.value && rail.value)

const opened = ref(['rrhh'])
const activeItem = 'Solicitudes'

const items = [
  { title: 'Solicitudes', icon: mdiClipboardTextOutline },
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

function expandFromRail() {
  rail.value = false
  opened.value = ['rrhh']
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
          <v-list-item
            v-bind="props"
            :prepend-icon="mdiAccountGroup"
            @click="expandFromRail"
          />
        </template>

        <v-list density="compact" nav min-width="220">
          <v-list-item
            v-for="item in items"
            :key="item.title"
            :prepend-icon="item.icon"
            :title="item.title"
            :active="item.title === activeItem"
            :color="item.title === activeItem ? 'primary' : undefined"
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
          v-for="item in items"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :active="item.title === activeItem"
          :variant="item.title === activeItem ? 'flat' : 'text'"
          :color="item.title === activeItem ? 'primary' : undefined"
          @click="selectItem"
        />
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>
