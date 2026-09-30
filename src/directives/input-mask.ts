import type { Directive } from 'vue'
import { INPUT_MASKS, type InputMaskType } from '@/utils'

type MaskedElement = HTMLElement & { __inputMaskHandler?: (event: Event) => void }

function findInput(root: HTMLElement): HTMLInputElement | HTMLTextAreaElement | null {
  return root.querySelector('input, textarea')
}

// Escucha en fase de captura sobre la raíz del componente: corre antes que el handler de Vuetify,
// así v-model recibe siempre el valor ya filtrado (teclado, pegado, arrastrar e IME por igual).
export const vInputMask: Directive<HTMLElement, InputMaskType | undefined> = {
  mounted(el: MaskedElement, binding) {
    const handler = (event: Event) => {
      const mask = binding.value
      const target = event.target
      if (!mask || !(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return
      if (target !== findInput(el)) return

      const raw = target.value
      const clean = INPUT_MASKS[mask](raw)
      if (clean === raw) return

      const caret = target.selectionStart
      target.value = clean
      if (caret !== null) {
        const position = Math.max(0, caret - (raw.length - clean.length))
        target.setSelectionRange(position, position)
      }
    }
    el.__inputMaskHandler = handler
    el.addEventListener('input', handler, true)
  },
  updated(el: MaskedElement, binding) {
    // Al cambiar de máscara (ej. tipo de identificación) el valor vigente se re-filtra.
    if (binding.value === binding.oldValue || !binding.value) return
    const input = findInput(el)
    if (!input) return
    const clean = INPUT_MASKS[binding.value](input.value)
    if (clean !== input.value) {
      input.value = clean
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }
  },
  unmounted(el: MaskedElement) {
    if (el.__inputMaskHandler) el.removeEventListener('input', el.__inputMaskHandler, true)
  },
}
