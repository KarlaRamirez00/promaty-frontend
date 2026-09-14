<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay, useTheme } from 'vuetify'
import { useQueryClient } from '@tanstack/vue-query'
import {
  mdiBellOutline,
  mdiCogOutline,
  mdiHomeOutline,
  mdiLogoutVariant,
  mdiMenu,
  mdiMenuClose,
  mdiMenuOpen,
  mdiWeatherNight,
  mdiWeatherSunny,
} from '@mdi/js'
import { useSidebarRail } from '@/composables/useSidebarRail'
import { useAuthStore } from '@/stores'
import { ROUTE } from '@/router/route-names'
import type { Breadcrumb } from '@/types/navigation'

const props = defineProps<{
  breadcrumbs: Breadcrumb[]
}>()

const { rail, open, mobile, toggleRail } = useSidebarRail()
const { xs } = useDisplay()
const theme = useTheme()
const router = useRouter()
const auth = useAuthStore()
const queryClient = useQueryClient()

const isDark = computed(() => theme.global.name.value === 'dark')

const currentTitle = computed(
  () => props.breadcrumbs[props.breadcrumbs.length - 1]?.title ?? '',
)

function toggleTheme() {
  theme.change(isDark.value ? 'light' : 'dark')
}

function logout() {
  auth.logout()
  queryClient.clear()
  router.push({ name: ROUTE.LOGIN })
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
        :to="{ name: ROUTE.HOME }"
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
          <v-divider class="my-1" />
          <v-list-item :prepend-icon="mdiLogoutVariant" title="Cerrar sesión" @click="logout" />
        </v-list>
      </v-menu>
    </template>

    <template v-else>
      <v-breadcrumbs density="compact" class="px-4">
        <v-breadcrumbs-item :to="{ name: ROUTE.HOME }">
          <v-icon :icon="mdiHomeOutline" size="20" class="breadcrumb-home-icon" />
        </v-breadcrumbs-item>
        <template v-for="crumb in breadcrumbs" :key="crumb.title">
          <v-breadcrumbs-divider />
          <v-breadcrumbs-item :title="crumb.title" :to="crumb.to" :disabled="crumb.disabled" />
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

      <v-menu location="bottom end">
        <template #activator="{ props: menuProps }">
          <v-btn icon variant="text" class="mr-4" aria-label="Cuenta" v-bind="menuProps">
            <v-avatar color="primary" size="32">
              <span class="text-caption text-white">AD</span>
            </v-avatar>
          </v-btn>
        </template>

        <v-list density="compact" min-width="200">
          <v-list-item :prepend-icon="mdiLogoutVariant" title="Cerrar sesión" @click="logout" />
        </v-list>
      </v-menu>
    </template>
  </v-app-bar>
</template>

<style scoped>
/* Fuerza el mismo gris en todos los crumbs (clickeables o no) y solo agrega un hover sutil a los
   que sí navegan, en vez del color de link/tema por defecto. */
:deep(.v-breadcrumbs-item),
:deep(.v-breadcrumbs-item--link),
:deep(.v-breadcrumbs-divider),
:deep(.breadcrumb-home-icon) {
  color: rgba(var(--v-theme-on-surface), 0.6) !important;
  text-decoration: none;
}

/* El crumb de la página actual usa disabled: Vuetify le baja la opacidad — se la devolvemos
   para que se vea igual de gris que el resto, no más clara. */
:deep(.v-breadcrumbs-item--disabled) {
  opacity: 1;
}

:deep(.v-breadcrumbs-item--link) {
  border-radius: 4px;
  padding: 2px 6px;
  margin: -2px -6px;
  transition: background-color 0.15s ease, color 0.15s ease;
}

:deep(.v-breadcrumbs-item--link:hover) {
  background-color: rgba(var(--v-theme-on-surface), 0.06);
  color: rgba(var(--v-theme-on-surface), 0.87) !important;
}
</style>
