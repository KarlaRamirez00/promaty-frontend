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
</script>

<template>
  <v-dialog
    v-model="open"
    :width="xs ? '100%' : width"
    :fullscreen="xs"
    transition="detail-drawer-transition"
    content-class="detail-drawer"
  >
    <v-card class="detail-drawer__card d-flex flex-column">
      <div class="d-flex align-center justify-space-between pa-4 flex-shrink-0">
        <slot name="header">
          <div>
            <div v-if="resolvedTitle" class="text-h6 font-weight-bold">{{ resolvedTitle }}</div>
            <slot name="badge" />
          </div>
        </slot>
        <v-btn :icon="mdiClose" variant="text" size="small" @click="open = false" />
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

.detail-drawer-transition-enter-active,
.detail-drawer-transition-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.detail-drawer-transition-enter-from,
.detail-drawer-transition-leave-to {
  transform: translateX(100%);
}
</style>
