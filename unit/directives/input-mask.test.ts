import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { vInputMask } from '@/directives/input-mask'
import type { InputMaskType } from '@/utils'

function mountMasked(initial: InputMaskType | undefined) {
  const mask = ref<InputMaskType | undefined>(initial)
  const show = ref(true)
  const Host = defineComponent({
    directives: { inputMask: vInputMask },
    template: '<div v-if="show" v-input-mask="mask"><input /><span /></div>',
    setup: () => ({ mask, show }),
  })
  const wrapper = mount(Host, { attachTo: document.body })
  return { wrapper, mask, show, input: () => wrapper.find('input').element as HTMLInputElement }
}

describe('v-input-mask', () => {
  it('filtra lo que se escribe', async () => {
    const { wrapper, input } = mountMasked('onlyNumbers')
    const el = input()
    el.value = 'a1b2'
    el.setSelectionRange(4, 4)
    el.dispatchEvent(new Event('input', { bubbles: true }))
    expect(el.value).toBe('12')
    wrapper.unmount()
  })

  it('no toca un valor ya limpio ni eventos de otros elementos', () => {
    const { wrapper, input } = mountMasked('onlyNumbers')
    const el = input()
    el.value = '12'
    el.dispatchEvent(new Event('input', { bubbles: true }))
    expect(el.value).toBe('12')
    wrapper.find('span').element.dispatchEvent(new Event('input', { bubbles: true }))
    wrapper.unmount()
  })

  it('sin máscara no filtra', () => {
    const { wrapper, input } = mountMasked(undefined)
    const el = input()
    el.value = 'abc'
    el.dispatchEvent(new Event('input', { bubbles: true }))
    expect(el.value).toBe('abc')
    wrapper.unmount()
  })

  it('al cambiar la máscara vuelve a filtrar el valor vigente', async () => {
    const { wrapper, input, mask } = mountMasked('freeText')
    const el = input()
    el.value = 'ab12'
    mask.value = 'onlyNumbers'
    await nextTick()
    expect(el.value).toBe('12')

    mask.value = 'onlyLetters'
    await nextTick()
    expect(el.value).toBe('')

    mask.value = undefined
    await nextTick()
    wrapper.unmount()
  })

  it('mantiene el valor si ya cumple la nueva máscara', async () => {
    const { wrapper, input, mask } = mountMasked('freeText')
    input().value = '12'
    mask.value = 'onlyNumbers'
    await nextTick()
    expect(input().value).toBe('12')
    wrapper.unmount()
  })

  it('retira el listener al desmontar', async () => {
    const { wrapper, show } = mountMasked('onlyNumbers')
    const spy = vi.spyOn(wrapper.find('div').element, 'removeEventListener')
    show.value = false
    await nextTick()
    expect(spy).toHaveBeenCalledWith('input', expect.any(Function), true)
    wrapper.unmount()
  })
})
