import { onBeforeUnmount, onMounted, type Ref } from 'vue'

const DESKTOP_QUERY = '(min-width: 960px)'

// Estira el elemento hasta el borde inferior de la ventana. En pantallas chicas no actúa,
// porque las columnas se apilan y el alto lo define el contenido.
export function useFillViewport(target: Ref<HTMLElement | null>) {
  function update() {
    const element = target.value
    if (!element) return
    if (!window.matchMedia(DESKTOP_QUERY).matches) {
      element.style.minHeight = ''
      return
    }
    const bottomGap = Number.parseFloat(getComputedStyle(element.parentElement ?? element).paddingBottom) || 0
    const top = element.getBoundingClientRect().top + window.scrollY
    element.style.minHeight = `${Math.max(window.innerHeight - top - bottomGap, 0)}px`
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })
  onBeforeUnmount(() => window.removeEventListener('resize', update))
}
