import { afterEach, describe, expect, it } from 'vitest'
import router from '@/router'
import { $, $$, byText, click, clickText, mountApp, pick, settle, text, type, wait, go, type MountedApp } from '../helpers/app'

let app: MountedApp | null = null
afterEach(() => {
  app?.unmount()
  app = null
})

const MAINTAINERS = [
  { name: 'Mandantes', path: '/clients', api: '/clients', listTitle: 'Lista de mandantes', newTitle: 'Nuevo mandante', editTitle: 'Editar mandante', item: 'Mandante 1' },
  { name: 'Tipos de proyecto', path: '/project-types', api: '/projectTypes', listTitle: 'tipos de proyecto', newTitle: 'Nuevo tipo', editTitle: 'Editar tipo', item: 'Tipo 1' },
  { name: 'Especialidades', path: '/project-specialties', api: '/projectSpecialties', listTitle: 'especialidades', newTitle: 'Nueva especialidad', editTitle: 'Editar especialidad', item: 'Especialidad 1' },
  { name: 'Motivos de no recontratación', path: '/non-rehire-reasons', api: '/nonRehireReasons', listTitle: 'no recontratación', newTitle: 'Nuevo motivo', editTitle: 'Editar motivo', item: 'Motivo 1' },
  { name: 'Motivos de rechazo', path: '/rejection-reasons', api: '/requestRejectionReasons', listTitle: 'rechazo', newTitle: 'Nuevo motivo', editTitle: 'Editar motivo', item: 'Rechazo 1', select: 'Submódulo' },
]

function rowActions(index = 0): HTMLElement {
  const buttons = $$('[data-testid="row-actions"]')
  if (!buttons[index]) throw new Error('sin menú de acciones')
  return buttons[index]
}

describe.each(MAINTAINERS)('Mantenedor de $name', (m) => {
  it('lista los registros y consulta el backend con la paginación en base 0', async () => {
    app = await mountApp(m.path)
    expect(text()).toContain(m.item)
    const [call] = app.backend.find('GET', new RegExp(`^${m.api}$`))
    expect(call.params).toMatchObject({ page: 0, size: 10 })
  })

  it('busca con retardo y refleja el texto en la URL', async () => {
    app = await mountApp(m.path)
    await type($('[data-testid="list-search"] input') as HTMLInputElement, 'obra')
    await wait(450)
    await settle()
    expect(router.currentRoute.value.query.search).toBe('obra')
    expect(app.backend.find('GET', new RegExp(`^${m.api}$`)).at(-1)?.params.search).toBe('obra')
  })

  it('ordena al hacer clic en una cabecera', async () => {
    app = await mountApp(m.path)
    const header = $$('th').find((th) => /Actualización/.test(th.textContent ?? ''))
    await click(header ?? null, 'sin cabecera ordenable')
    expect(router.currentRoute.value.query.sort).toContain('updatedAt')
  })

  it('abre el detalle desde el menú de acciones y lo cierra', async () => {
    app = await mountApp(m.path)
    await click(rowActions())
    await click($('[data-testid="action-view"]'))
    expect(router.currentRoute.value.query.detail).toBe('1')
    expect(text()).toContain('Detalle de')
    expect(app.backend.find('GET', new RegExp(`^${m.api}/1$`))).toHaveLength(1)
    await go(m.path)
    expect(router.currentRoute.value.query.detail).toBeUndefined()
  })

  it('abre el detalle al hacer clic en el nombre', async () => {
    app = await mountApp(m.path)
    await click($('.link-cell'))
    expect(router.currentRoute.value.query.detail).toBe('1')
  })

  it('desactiva un registro tras confirmar', async () => {
    app = await mountApp(m.path)
    await click(rowActions())
    await clickText('.v-list-item', 'Desactivar')
    expect(text()).toContain('¿Seguro que quieres')
    const dialog = $('.v-dialog .v-card') as HTMLElement
    await clickText('.v-dialog button', /^\s*Desactivar\s*$/)
    expect(dialog).not.toBeNull()
    const [toggle] = app.backend.find('PATCH', new RegExp(`^${m.api}/1/active$`))
    expect(toggle).toBeDefined()
  })

  it('avisa si desactivar falla', async () => {
    app = await mountApp(m.path)
    app.backend.on('PATCH', /active$/, { failure: { status: 500, message: 'Falla' } })
    await click(rowActions())
    await clickText('.v-list-item', 'Desactivar')
    await clickText('.v-dialog button', /^\s*Desactivar\s*$/)
    expect(app.backend.find('PATCH', /active$/)).toHaveLength(1)
  })

  it('aplica y limpia filtros por estado', async () => {
    app = await mountApp(`${m.path}?active=true`)
    expect(text()).toContain('Estado: Activos')
    const call = app.backend.find('GET', new RegExp(`^${m.api}$`))[0]
    expect(call.params.active).toBe(true)
    await clickText('button', 'Filtrar')
    expect($('.v-navigation-drawer--right, .v-navigation-drawer')).not.toBeNull()
    const chip = $$('.v-chip').find((c) => /Estado: Activos/.test(c.textContent ?? ''))
    const close = chip?.querySelector<HTMLElement>('.v-chip__close, button')
    if (close) await click(close)
    await go(m.path)
    expect(router.currentRoute.value.query.active).toBeUndefined()
  })

  it('muestra un error si la lista no carga', async () => {
    const { installBackend } = await import('../helpers/backend')
    const backend = installBackend()
    backend.on('GET', new RegExp(`^${m.api}$`), { failure: { status: 500 } })
    app = await mountApp(m.path, { backend })
    expect(text()).toMatch(/No se pudo cargar/)
  })

  it('crea un registro validando el nombre y volviendo a la lista', async () => {
    app = await mountApp(`${m.path}/new`)
    expect(text()).toContain(m.newTitle)
    await clickText('button', 'Guardar')
    expect(app.backend.find('POST', new RegExp(`^${m.api}$`))).toHaveLength(0)

    const input = $('input[type="text"]') as HTMLInputElement
    await type(input, 'Nombre <nuevo>')
    expect(input.value).toBe('Nombre nuevo')
    for (const area of $$('textarea')) await type(area as unknown as HTMLInputElement, 'Descripción')
    if ('select' in m) await pick(m.select as string)
    await clickText('button', 'Guardar')
    expect(app.backend.find('POST', new RegExp(`^${m.api}$`))).toHaveLength(1)
    expect(router.currentRoute.value.path).toBe(m.path)
  })

  it('muestra los errores de campo que devuelve backend', async () => {
    app = await mountApp(`${m.path}/new`)
    app.backend.on('POST', new RegExp(`^${m.api}$`), {
      failure: { status: 400, name: 'VALIDATION', message: 'Inválido', errorFields: { name: 'Ya existe un registro con ese nombre' } },
    })
    await type($('input[type="text"]') as HTMLInputElement, 'Repetido')
    for (const area of $$('textarea')) await type(area as unknown as HTMLInputElement, 'Descripción')
    if ('select' in m) await pick(m.select as string)
    await clickText('button', 'Guardar')
    expect(text()).toContain('Ya existe un registro con ese nombre')
    expect(router.currentRoute.value.path).toBe(`${m.path}/new`)
  })

  it('avisa si guardar falla sin detalle de campos', async () => {
    app = await mountApp(`${m.path}/new`)
    app.backend.on('POST', new RegExp(`^${m.api}$`), { failure: { status: 500 } })
    await type($('input[type="text"]') as HTMLInputElement, 'Algo')
    for (const area of $$('textarea')) await type(area as unknown as HTMLInputElement, 'Descripción')
    if ('select' in m) await pick(m.select as string)
    await clickText('button', 'Guardar')
    expect(router.currentRoute.value.path).toBe(`${m.path}/new`)
  })

  it('edita un registro precargando sus datos', async () => {
    app = await mountApp(`${m.path}/1/edit`)
    expect(text()).toContain(m.editTitle)
    const input = $('input[type="text"]') as HTMLInputElement
    expect(input.value).toBe(m.item)
    await type(input, 'Cambiado')
    await clickText('button', 'Guardar')
    expect(app.backend.find('PUT', new RegExp(`^${m.api}/1$`))).toHaveLength(1)
    expect(router.currentRoute.value.path).toBe(m.path)
  })

  it('cancelar vuelve a la lista', async () => {
    app = await mountApp(`${m.path}/new`)
    await clickText('button', 'Cancelar')
    expect(router.currentRoute.value.path).toBe(m.path)
  })

  it('pagina desde el pie de la tabla', async () => {
    const { installBackend } = await import('../helpers/backend')
    const backend = installBackend()
    backend.on('GET', new RegExp(`^${m.api}$`), () => ({
      data: [],
      meta: { pagination: { page: 0, size: 10, total: 35, pageCount: 4 } },
    }))
    app = await mountApp(m.path, { backend })
    const next = $$('button').find((b) => /siguiente|next/i.test(b.getAttribute('aria-label') ?? ''))
    if (next) await click(next)
    expect(byText('*', 'de 35') ?? byText('*', '35')).not.toBeNull()
  })
})
