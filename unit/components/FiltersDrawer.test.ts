import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { vuetify } from '@/plugins/vuetify'
import { vInputMask } from '@/directives/input-mask'
import FiltersDrawer, { type FilterField } from '@/components/common/FiltersDrawer.vue'
import { $$, click, settle } from '../helpers/app'

let wrapper: VueWrapper | null = null
afterEach(() => {
  wrapper?.unmount()
  wrapper = null
  for (const el of $$('.v-overlay-container')) el.replaceChildren()
})

const FIELDS: FilterField[] = [
  { key: 'status', type: 'select', label: 'Estado', options: [{ title: 'Activo', value: 1 }] },
  { key: 'center', type: 'autocomplete', label: 'Centro', options: ['A', 'B'] },
  { key: 'urgent', type: 'boolean', label: 'Urgente' },
  { key: 'range', type: 'date', label: 'Rango', range: true },
  { key: 'month', type: 'date', label: 'Mes', mode: 'month' },
]

function host() {
  const values = ref<Record<string, unknown>>({ status: 1, center: null, urgent: null, range: null, month: null })
  const open = ref(true)
  const cleared = ref(0)
  const Host = defineComponent({
    setup: () => () =>
      h(FiltersDrawer, {
        fields: FIELDS,
        open: open.value,
        'onUpdate:open': (v: boolean) => (open.value = v),
        values: values.value,
        'onUpdate:values': (v: Record<string, unknown>) => (values.value = v),
        onClear: () => cleared.value++,
      }),
  })
  wrapper = mount(Host, { attachTo: document.body, global: { plugins: [createPinia(), vuetify], directives: { 'input-mask': vInputMask } } })
  return { values, open, cleared }
}

const button = (label: string) => $$('button').find((b) => (b.textContent ?? '').trim() === label) ?? null

describe('FiltersDrawer', () => {
  it('muestra un campo por filtro con su etiqueta', async () => {
    host()
    await settle()
    const text = document.body.textContent ?? ''
    for (const label of ['Estado', 'Centro', 'Urgente', 'Rango', 'Mes', 'Filtros']) expect(text).toContain(label)
  })

  it('aplica el borrador solo al pulsar Aplicar y cierra el panel', async () => {
    const { values, open } = host()
    await settle()
    const switchInput = $$('.v-switch input')[0]
    await click(switchInput)
    expect(values.value.urgent).toBeNull()
    await click(button('Aplicar'))
    expect(values.value.urgent).toBe(true)
    expect(values.value.status).toBe(1)
    expect(open.value).toBe(false)
  })

  it('limpiar vacía el borrador y avisa al padre', async () => {
    const { values, cleared } = host()
    await settle()
    await click(button('Limpiar'))
    expect(cleared.value).toBe(1)
    await click(button('Aplicar'))
    expect(Object.values(values.value).every((v) => v === null)).toBe(true)
  })

  it('cerrar el panel descarta los cambios sin aplicar', async () => {
    const { values, open } = host()
    await settle()
    await click($$('[aria-label="Cerrar filtros"]')[0])
    expect(open.value).toBe(false)
    expect(values.value.status).toBe(1)
  })

  it('al reabrir parte de los valores vigentes', async () => {
    const { values, open } = host()
    await settle()
    await click($$('.v-switch input')[0])
    await click($$('[aria-label="Cerrar filtros"]')[0])
    open.value = true
    await settle()
    await click(button('Aplicar'))
    expect(values.value.urgent).toBeNull()
  })
})
