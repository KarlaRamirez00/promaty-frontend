<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { mdiClose } from '@mdi/js'

const props = withDefaults(
  defineProps<{
    title?: string
    entity?: string
    width?: number | string
  }>(),
  {
    width: 380,
  },
)

const open = defineModel<boolean>('open', { default: false })

// Panel lateral sobre v-dialog: v-navigation-drawer requiere ser hijo directo
// de v-app y este panel se invoca desde vistas anidadas en v-main.
const { xs } = useDisplay()

const resolvedTitle = computed(() =>
  props.entity ? `Detalle de ${props.entity}` : props.title,
)

// El calendario de VueDatePicker se teletransporta a <body>, fuera del árbol DOM del dialog:
// Vuetify lo trata como clic externo y cerraría el drawer al elegir una fecha. persistent +
// este handler dejan el cierre por clic afuera intacto para el resto de los casos.
function onClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (target?.closest('.dp__menu, .dp__outer_menu_wrap')) return
  open.value = false
}
</script>

<template>
  <v-dialog
    v-model="open"
    :width="xs ? '100%' : width"
    :fullscreen="xs"
    persistent
    transition="detail-drawer-transition"
    content-class="detail-drawer"
    @click:outside="onClickOutside"
  >
    <v-card class="detail-drawer__card d-flex flex-column">
      <div class="detail-drawer__header pa-4 flex-shrink-0">
        <slot name="header">
          <div>
            <div v-if="resolvedTitle" class="text-h6 font-weight-bold">{{ resolvedTitle }}</div>
            <slot name="badge" />
          </div>
        </slot>
        <div class="detail-drawer__header-actions d-flex flex-column align-center">
          <!-- En fullscreen (mobile) no hay "afuera" que clickear para cerrar: se mantiene la X. -->
          <v-btn v-if="xs" :icon="mdiClose" variant="text" size="small" @click="open = false" />
          <slot name="menu" />
        </div>
      </div>

      <v-divider />

      <div class="pa-2 flex-grow-1 overflow-y-auto">
        <slot />
      </div>

      <template v-if="$slots.actions">
        <v-divider />
        <div class="pa-4 d-flex flex-column ga-2 flex-shrink-0">
          <slot name="actions" />
        </div>
      </template>
    </v-card>
  </v-dialog>
</template>

<style>
/* Sin "scoped": v-dialog teletransporta su contenido fuera del componente. */
.v-dialog:not(.v-dialog--fullscreen) > .v-overlay__content.detail-drawer {
  position: fixed !important;
  inset: 0 0 0 auto !important;
  margin: 0 !important;
  /* Reserva una franja de scrim visible con cualquier valor de width. */
  max-width: calc(100vw - 32px) !important;
  max-height: 100% !important;
}

.v-dialog > .v-overlay__content.detail-drawer > .detail-drawer__card {
  border-radius: 0;
}

/* El botón "..."/X queda posicionado absoluto en la esquina en vez de reservar una columna en el
   flex row del header — así el contenido del header (título, y cualquier bloque de ancho completo
   debajo, ej. el selector de cambio de estado) usa el 100% del ancho disponible, sin el descuento
   fijo de la columna del ícono. */
.detail-drawer__card .detail-drawer__header {
  position: relative;
}

.detail-drawer__card .detail-drawer__header-actions {
  position: absolute;
  top: 16px;
  right: 16px;
}

.detail-drawer-transition-enter-active,
.detail-drawer-transition-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.detail-drawer-transition-enter-from,
.detail-drawer-transition-leave-to {
  transform: translateX(100%);
}
</style>
