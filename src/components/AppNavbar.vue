<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay, useTheme } from 'vuetify'
import {
  mdiBellOutline,
  mdiCogOutline,
  mdiHomeOutline,
  mdiMenu,
  mdiMenuClose,
  mdiMenuOpen,
  mdiWeatherNight,
  mdiWeatherSunny,
} from '@mdi/js'
import { useSidebarRail } from '../composables/useSidebarRail'

const props = defineProps<{
  breadcrumbs: { title: string; disabled?: boolean }[]
}>()

const { rail, open, mobile, toggleRail } = useSidebarRail()
const { xs } = useDisplay()
const theme = useTheme()

const isDark = computed(() => theme.global.name.value === 'dark')

const currentTitle = computed(
  () => props.breadcrumbs[props.breadcrumbs.length - 1]?.title ?? '',
)

function toggleTheme() {
  theme.change(isDark.value ? 'light' : 'dark')
}
</script>

<template>
  <v-app-bar
    color="surface"
    flat
    border
    density="comfortable"
    :scroll-behavior="xs ? '' : 'hide'"
  >
    <v-btn
      icon
      variant="text"
      density="compact"
      class="ml-2"
      :aria-label="mobile ? (open ? 'Cerrar menú lateral' : 'Abrir menú lateral') : (rail ? 'Expandir menú lateral' : 'Colapsar menú lateral')"
      @click="toggleRail"
    >
      <v-icon
        :icon="mobile ? mdiMenu : (rail ? mdiMenuClose : mdiMenuOpen)"
        size="20"
        color="grey-darken-1"
      />
    </v-btn>

    <template v-if="xs">
      <v-btn
        icon
        variant="text"
        density="compact"
        class="ml-1"
        aria-label="Ir al inicio"
      >
        <v-icon :icon="mdiHomeOutline" size="20" color="grey-darken-1" />
      </v-btn>

      <span class="text-subtitle-2 text-truncate flex-grow-1 px-2">
        {{ currentTitle }}
      </span>

      <v-menu location="bottom end">
        <template #activator="{ props: menuProps }">
          <v-btn
            icon
            variant="text"
            class="mr-2"
            aria-label="Cuenta y opciones"
            v-bind="menuProps"
          >
            <v-avatar color="primary" size="32">
              <span class="text-caption text-white">AD</span>
            </v-avatar>
          </v-btn>
        </template>

        <v-list density="compact" min-width="200">
          <v-list-item :prepend-icon="mdiBellOutline" title="Notificaciones" />
          <v-list-item :prepend-icon="mdiCogOutline" title="Configuración" />
          <v-list-item
            :prepend-icon="isDark ? mdiWeatherSunny : mdiWeatherNight"
            :title="isDark ? 'Tema claro' : 'Tema oscuro'"
            @click="toggleTheme"
          />
        </v-list>
      </v-menu>
    </template>

    <template v-else>
      <v-breadcrumbs density="compact" class="px-4">
        <v-breadcrumbs-item>
          <v-icon :icon="mdiHomeOutline" size="20" color="grey-darken-1" />
        </v-breadcrumbs-item>
        <template v-for="crumb in breadcrumbs" :key="crumb.title">
          <v-breadcrumbs-divider />
          <v-breadcrumbs-item :title="crumb.title" :disabled="crumb.disabled" />
        </template>
      </v-breadcrumbs>

      <v-spacer />

      <v-btn icon variant="text" aria-label="Notificaciones">
        <v-icon :icon="mdiBellOutline" size="20" color="grey-darken-1" />
      </v-btn>

      <v-btn icon variant="text" aria-label="Configuración">
        <v-icon :icon="mdiCogOutline" size="20" color="grey-darken-1" />
      </v-btn>

      <v-btn
        icon
        variant="text"
        :aria-label="isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
        @click="toggleTheme"
      >
        <v-icon
          :icon="isDark ? mdiWeatherSunny : mdiWeatherNight"
          size="20"
          color="grey-darken-1"
        />
      </v-btn>

      <v-avatar color="primary" size="32" class="mr-4">
        <span class="text-caption text-white">AD</span>
      </v-avatar>
    </template>
  </v-app-bar>
</template>
