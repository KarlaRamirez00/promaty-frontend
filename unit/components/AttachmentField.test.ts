import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import type { VueWrapper } from '@vue/test-utils'
import AttachmentField from '@/components/common/AttachmentField.vue'
import { CONTRACT_ATTACHMENT_RULE, STAFF_ATTACHMENT_RULE, type AttachmentRule } from '@/models'
import { fileList, mountComponent } from '../helpers/component'
import { settle } from '../helpers/app'

let wrapper: VueWrapper | null = null
afterEach(() => {
  wrapper?.unmount()
  wrapper = null
})

const MANY: AttachmentRule = { formats: ['pdf', 'png'], maxFiles: 3 }
const UNLIMITED: AttachmentRule = { formats: ['pdf'], maxFiles: null }
const pdf = (name = 'a.pdf', size = 10) => {
  const file = new File(['x'], name, { type: 'application/pdf' })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

function mountField(props: Record<string, unknown> = {}) {
  wrapper = mountComponent(AttachmentField, { rule: MANY, saved: [], ...props })
  return wrapper
}

async function choose(files: File[]) {
  const input = wrapper!.find('input[type="file"]')
  Object.defineProperty(input.element, 'files', { value: fileList(...files), configurable: true })
  await input.trigger('change')
  await settle(2)
}

const emitted = () => (wrapper!.emitted('update:modelValue') ?? []) as File[][][]

describe('AttachmentField', () => {
  it('muestra los formatos permitidos y el límite de tamaño', () => {
    mountField()
    expect(wrapper!.text()).toContain('.PDF, .PNG')
    expect(wrapper!.text()).toContain('Máx. 20MB')
    expect(wrapper!.text()).toContain('Agrega o arrastra los archivos aquí')
  })

  it('usa el texto singular si solo admite un archivo', () => {
    mountField({ rule: { formats: ['pdf'], maxFiles: 1 }, label: 'Cédula' })
    expect(wrapper!.text()).toContain('Cédula')
    expect(wrapper!.text()).toContain('el archivo aquí')
    expect(wrapper!.find('input[type="file"]').attributes('multiple')).toBeUndefined()
  })

  it('agrega los archivos elegidos', async () => {
    mountField()
    await choose([pdf('uno.pdf'), pdf('dos.pdf')])
    expect(emitted().at(-1)?.[0].map((f) => f.name)).toEqual(['uno.pdf', 'dos.pdf'])
  })

  it('rechaza formatos no permitidos y archivos demasiado grandes', async () => {
    mountField()
    await choose([pdf('virus.exe')])
    expect(wrapper!.text()).toContain('Formato no permitido')
    expect(emitted()).toHaveLength(0)
    await choose([pdf('grande.pdf', 21 * 1024 * 1024)])
    expect(wrapper!.text()).toContain('supera el máximo de 20 MB')
  })

  it('respeta el máximo de archivos', async () => {
    mountField({ rule: MANY })
    await choose([pdf('1.pdf'), pdf('2.pdf'), pdf('3.pdf'), pdf('4.pdf')])
    expect(wrapper!.text()).toContain('Solo se permiten 3 archivos.')
    expect(emitted().at(-1)?.[0]).toHaveLength(3)
  })

  it('con un solo archivo permitido informa el límite en singular', async () => {
    mountField({ rule: { formats: ['pdf'], maxFiles: 1 } })
    await choose([pdf('1.pdf'), pdf('2.pdf')])
    expect(wrapper!.text()).toContain('Solo se permite 1 archivo.')
  })

  it('acepta archivos arrastrados y marca la zona mientras se arrastra', async () => {
    mountField({ rule: UNLIMITED })
    const zone = wrapper!.find('.attachment-field__dropzone')
    await zone.trigger('dragover')
    expect(zone.classes()).toContain('attachment-field__dropzone--active')
    await zone.trigger('dragleave')
    expect(zone.classes()).not.toContain('attachment-field__dropzone--active')
    await zone.trigger('drop', { dataTransfer: { files: [pdf('arrastrado.pdf')] } })
    expect(emitted().at(-1)?.[0].map((f) => f.name)).toEqual(['arrastrado.pdf'])
  })

  it('ignora el arrastre cuando ya está lleno', async () => {
    mountField({ rule: { formats: ['pdf'], maxFiles: 1 }, modelValue: [pdf('uno.pdf')] })
    const zone = wrapper!.find('.attachment-field__dropzone')
    expect(zone.attributes('aria-disabled')).toBe('true')
    await zone.trigger('dragover')
    await zone.trigger('drop', { dataTransfer: { files: [pdf('otro.pdf')] } })
    await zone.trigger('click')
    expect(emitted()).toHaveLength(0)
  })

  it('abre el selector de archivos al hacer clic', async () => {
    mountField()
    let clicked = false
    wrapper!.find('input[type="file"]').element.addEventListener('click', () => (clicked = true))
    await wrapper!.find('.attachment-field__dropzone').trigger('click')
    expect(clicked).toBe(true)
  })

  it('muestra los adjuntos guardados y avisa al descargar o quitar', async () => {
    const saved = [{ id: 1, name: 'cv.PDF', fileType: 'pdf', fileSizeLabel: '2 KB', mediaFileId: 'm', updatedAt: 'x' }]
    mountField({ saved })
    expect(wrapper!.text()).toContain('cv.PDF')
    await wrapper!.find('[aria-label="Descargar"]').trigger('click')
    await wrapper!.find('[aria-label="Eliminar"]').trigger('click')
    expect(wrapper!.emitted('download')?.[0]).toEqual([saved[0]])
    expect(wrapper!.emitted('removeSaved')?.[0]).toEqual([saved[0]])
  })

  it('en modo solo lectura no permite agregar ni quitar', () => {
    const saved = [{ id: 1, name: 'cv.pdf', fileType: 'pdf', fileSizeLabel: '2 KB', mediaFileId: 'm', updatedAt: 'x' }]
    mountField({ saved, readonly: true })
    expect(wrapper!.find('input[type="file"]').exists()).toBe(false)
    expect(wrapper!.find('[aria-label="Eliminar"]').exists()).toBe(false)
    expect(wrapper!.find('[aria-label="Descargar"]').exists()).toBe(true)
  })

  it('muestra el error externo y marca la zona', async () => {
    mountField({ externalError: 'Falta el adjunto' })
    expect(wrapper!.text()).toContain('Falta el adjunto')
    expect(wrapper!.find('.attachment-field__dropzone--error').exists()).toBe(true)
  })

  it('renombra un archivo pendiente conservando su extensión', async () => {
    mountField({ modelValue: [pdf('original.pdf')] })
    await wrapper!.find('[aria-label="Editar nombre"]').trigger('click')
    const input = wrapper!.find('input[aria-label="Nombre del archivo"]')
    await input.setValue('nuevo-nombre')
    await wrapper!.find('[aria-label="Confirmar nombre"]').trigger('click')
    expect(emitted().at(-1)?.[0][0].name).toBe('nuevo-nombre.pdf')
  })

  it('no permite dejar el nombre vacío y se puede cancelar con Escape', async () => {
    mountField({ modelValue: [pdf('original.pdf')] })
    await wrapper!.find('[aria-label="Editar nombre"]').trigger('click')
    const input = wrapper!.find('input[aria-label="Nombre del archivo"]')
    await input.setValue('   ')
    await input.trigger('keydown.enter')
    await nextTick()
    expect(wrapper!.text()).toContain('El nombre no puede quedar vacío.')
    await input.trigger('keydown.esc')
    await nextTick()
    expect(wrapper!.find('input[aria-label="Nombre del archivo"]').exists()).toBe(false)
  })

  it('confirma el nombre con Enter', async () => {
    mountField({ modelValue: [pdf('original.pdf')] })
    await wrapper!.find('[aria-label="Editar nombre"]').trigger('click')
    const input = wrapper!.find('input[aria-label="Nombre del archivo"]')
    await input.setValue('otro')
    await input.trigger('keydown.enter')
    expect(emitted().at(-1)?.[0][0].name).toBe('otro.pdf')
  })

  it('quita un archivo pendiente, incluso el que se está editando', async () => {
    mountField({ modelValue: [pdf('a.pdf'), pdf('b.png')] })
    await wrapper!.find('[aria-label="Editar nombre"]').trigger('click')
    await wrapper!.findAll('[aria-label="Eliminar"]')[0].trigger('click')
    expect(emitted().at(-1)?.[0].map((f) => f.name)).toEqual(['b.png'])
  })

  it('elige un ícono según la extensión', () => {
    mountField({ rule: { formats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt'], maxFiles: null }, modelValue: ['a.pdf', 'b.doc', 'c.xlsx', 'd.jpg', 'e.txt', 'sinextension'].map((n) => pdf(n)) })
    expect(wrapper!.findAll('.attachment-field__item')).toHaveLength(6)
  })

  it('las reglas de cada módulo definen formatos y cantidad', () => {
    expect(STAFF_ATTACHMENT_RULE.formats.length).toBeGreaterThan(0)
    expect(CONTRACT_ATTACHMENT_RULE.maxFiles).toBeGreaterThan(0)
  })
})
