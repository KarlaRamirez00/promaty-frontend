import { afterEach, describe, expect, it } from 'vitest'
import type { VueWrapper } from '@vue/test-utils'
import { VDateInput } from 'vuetify/labs/VDateInput'
import DateField from '@/components/common/DateField.vue'
import { mountComponent } from '../helpers/component'
import { settle } from '../helpers/app'

let wrapper: VueWrapper | null = null
afterEach(() => {
  wrapper?.unmount()
  wrapper = null
})

const mountDate = (props: Record<string, unknown> = {}) => {
  wrapper = mountComponent(DateField, { label: 'Fecha', ...props })
  return wrapper
}

const input = () => wrapper!.findComponent(VDateInput)
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d)
const lastModel = () => (wrapper!.emitted('update:modelValue') ?? []).at(-1)?.[0]
const pushValue = async (value: unknown) => {
  input().vm.$emit('update:modelValue', value)
  await settle(2)
}

describe('DateField', () => {
  it('muestra la etiqueta y el formato dd/MM/yyyy', async () => {
    mountDate({ modelValue: '2026-03-05' })
    await settle()
    expect(wrapper!.text()).toContain('Fecha')
    expect((wrapper!.find('input').element as HTMLInputElement).value).toBe('05/03/2026')
  })

  it('emite la fecha elegida en formato ISO', async () => {
    mountDate()
    await pushValue(day(2026, 3, 5))
    expect(lastModel()).toBe('2026-03-05')
  })

  it('emite null al limpiar', async () => {
    mountDate({ modelValue: '2026-03-05' })
    await pushValue(null)
    expect(lastModel()).toBeNull()
    await pushValue([])
    expect(lastModel()).toBeNull()
  })

  it('en modo mes muestra MM/yyyy', async () => {
    mountDate({ monthPicker: true, modelValue: '2026-03-05' })
    await settle()
    expect((wrapper!.find('input').element as HTMLInputElement).value).toBe('03/2026')
  })

  describe('rango', () => {
    it('retiene el primer clic y emite los extremos al elegir el segundo', async () => {
      mountDate({ range: true })
      await pushValue([day(2026, 3, 5)])
      expect(lastModel()).toBeUndefined()
      await pushValue([day(2026, 3, 5), day(2026, 3, 6), day(2026, 3, 7)])
      expect(lastModel()).toEqual(['2026-03-05', '2026-03-07'])
    })

    it('un segundo clic en el mismo día cierra un rango de un día', async () => {
      mountDate({ range: true })
      await pushValue([day(2026, 3, 5)])
      await pushValue([day(2026, 3, 5)])
      expect(lastModel()).toEqual(['2026-03-05', '2026-03-05'])
    })

    it('expande los extremos guardados a todos los días del intervalo', async () => {
      mountDate({ range: true, modelValue: ['2026-03-05', '2026-03-08'] })
      await settle()
      expect(input().props('modelValue')).toHaveLength(4)
    })

    it('un solo extremo guardado se muestra como un día', async () => {
      mountDate({ range: true, modelValue: ['2026-03-05'] })
      await settle()
      expect(input().props('modelValue')).toHaveLength(1)
    })

    it('sin valor el rango queda vacío', () => {
      mountDate({ range: true })
      expect(input().props('modelValue')).toEqual([])
    })

    it('al limpiar un rango guardado emite null', async () => {
      mountDate({ range: true, modelValue: ['2026-03-05', '2026-03-06'] })
      await pushValue([])
      expect(lastModel()).toBeNull()
    })
  })

  it('pasa los límites mínimo y máximo al calendario', async () => {
    mountDate({ minDate: '2026-01-10', maxDate: '2026-01-20', modelValue: '2026-01-15' })
    await settle()
    expect((input().props('min') as Date).getDate()).toBe(10)
    expect((input().props('max') as Date).getDate()).toBe(20)
  })

  it('con un máximo en el pasado y sin valor, el calendario abre en ese mes', async () => {
    mountDate({ maxDate: '2000-05-10' })
    await settle()
    expect(input().props('year')).toBe(2000)
    expect(input().props('month')).toBe(4)
    const component = input()
    component.vm.$emit('update:year', 1999)
    component.vm.$emit('update:month', 1)
    await settle(2)
  })

  it('con un máximo futuro no controla la vista', async () => {
    mountDate({ maxDate: '2999-05-10' })
    await settle()
    expect(input().props('year')).toBeUndefined()
  })
})
