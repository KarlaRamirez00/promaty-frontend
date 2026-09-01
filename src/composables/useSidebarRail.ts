import { inject, provide, ref, watch, type InjectionKey, type Ref } from 'vue'
import { useDisplay } from 'vuetify'

interface SidebarRailContext {
  rail: Ref<boolean>
  open: Ref<boolean>
  mobile: Ref<boolean>
  toggleRail: () => void
}

const SidebarRailKey: InjectionKey<SidebarRailContext> = Symbol('SidebarRail')

export function provideSidebarRail() {
  const { mobile } = useDisplay()
  const rail = ref(false)
  const open = ref(!mobile.value)

  // El drawer cambia entre permanente y temporal según el breakpoint; sin esto
  // open queda desincronizado con su estado interno y el botón necesita dos toques.
  watch(mobile, (isMobile) => {
    open.value = !isMobile
    if (isMobile) rail.value = false
  })

  const toggleRail = () => {
    if (mobile.value) {
      open.value = !open.value
    } else {
      rail.value = !rail.value
    }
  }

  const context: SidebarRailContext = { rail, open, mobile, toggleRail }
  provide(SidebarRailKey, context)
  return context
}

export function useSidebarRail(): SidebarRailContext {
  const context = inject(SidebarRailKey)
  if (!context) {
    throw new Error('useSidebarRail() debe usarse dentro de un árbol donde App.vue haya llamado a provideSidebarRail()')
  }
  return context
}
