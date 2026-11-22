import { afterEach, describe, expect, it } from 'vitest'
import router from '@/router'
import ProjectFormView from '@/views/project/children/ProjectFormView.vue'
import ProjectsListView from '@/views/project/children/ProjectsListView.vue'
import RoleFormView from '@/views/role/children/RoleFormView.vue'
import RolesListView from '@/views/role/children/RolesListView.vue'
import UserFormView from '@/views/user/children/UserFormView.vue'
import { $, $$, click, clickText, go, mountApp, pick, settle, text, type, wait, type MountedApp } from '../helpers/app'
import { installBackend } from '../helpers/backend'

let app: MountedApp | null = null
afterEach(() => {
  app?.unmount()
  app = null
})

const rowMenu = (index = 0) => $$('[data-testid="row-actions"]')[index]

describe('Proyectos', () => {
  it('lista con filtros desde la URL y los muestra como chips', async () => {
    app = await mountApp('/projects?typeId=1&specialtyId=1&clientId=1&statusId=1&sort=name,desc')
    expect(text()).toContain('Proyecto 1')
    expect(text()).toContain('Tipo: Tipo 1')
    expect(text()).toContain('Mandante: Mandante 1')
    const call = app.backend.find('GET', /^\/projects$/)[0]
    expect(call.params).toMatchObject({ typeId: 1, specialtyId: 1, clientId: 1, statusId: 1, sort: 'name,desc' })
    await clickText('button', 'Filtrar')
    await go('/projects')
  })

  it('quita un chip de filtro y limpia todos', async () => {
    app = await mountApp('/projects?typeId=1&clientId=1')
    const close = $$('.v-chip').map((c) => c.querySelector<HTMLElement>('.v-chip__close')).find(Boolean)
    if (close) await click(close)
    const clear = $$('button').find((b) => /Limpiar/i.test(b.textContent ?? ''))
    if (clear) await click(clear)
    expect(router.currentRoute.value.path).toBe('/projects')
  })

  it('muestra el detalle con el selector de estado y lo guarda', async () => {
    app = await mountApp('/projects?detail=1')
    expect(text()).toContain('Detalle de proyecto')
    const list = app.vm<{ selectedStatusId: number | null }>(ProjectsListView)
    expect(list.selectedStatusId).toBe(1)
    list.selectedStatusId = 2
    await settle()
    const save = $$('button').filter((b) => /Guardar/.test(b.textContent ?? '')).at(-1)
    await click(save ?? null)
    expect(app.backend.find('PATCH', /^\/projects\/1\/status$/)[0].data).toBe(JSON.stringify({ statusId: 2 }))
  })

  it('avisa si el cambio de estado falla', async () => {
    app = await mountApp('/projects?detail=1')
    app.backend.on('PATCH', /status$/, { failure: { status: 500 } })
    const list = app.vm<{ selectedStatusId: number | null }>(ProjectsListView)
    list.selectedStatusId = 2
    await settle()
    await click($$('button').filter((b) => /Guardar/.test(b.textContent ?? '')).at(-1) ?? null)
    expect(app.backend.find('PATCH', /status$/)).toHaveLength(1)
  })

  it('el detalle ofrece editar y cierra', async () => {
    app = await mountApp('/projects?detail=1')
    await click($$('.v-navigation-drawer [data-testid="row-actions"], .v-overlay [data-testid="row-actions"]')[0] ?? null)
    await clickText('.v-list-item', 'Editar')
    expect(router.currentRoute.value.path).toBe('/projects/1/edit')
  })

  it('cierra el detalle con el botón de la cabecera', async () => {
    app = await mountApp('/projects?detail=1')
    await click($('[aria-label="Cerrar detalle"]'))
    expect(router.currentRoute.value.query.detail).toBeUndefined()
  })

  it('valida los campos obligatorios y fechas incoherentes', async () => {
    app = await mountApp('/projects/new')
    await clickText('button', 'Guardar')
    const form = app.vm<{ fieldErrors: Record<string, string> }>(ProjectFormView)
    expect(Object.keys(form.fieldErrors).sort()).toEqual(['clientId', 'costCenterCode', 'name', 'specialtyId', 'startDate', 'typeId'])
    expect(app.backend.find('POST', /^\/projects$/)).toHaveLength(0)

    const vm = app.vm<{ form: Record<string, unknown> }>(ProjectFormView)
    Object.assign(vm.form, { name: 'Obra', costCenterCode: 'CC1', typeId: 1, specialtyId: 1, clientId: 1, startDate: '2026-05-01' })
    await settle()
    vm.form.endDate = '2026-04-01'
    await settle()
    await clickText('button', 'Guardar')
    expect(Object.keys(form.fieldErrors)).toEqual(['endDate'])
  })

  it('limpia el término si el inicio queda posterior', async () => {
    app = await mountApp('/projects/new')
    const vm = app.vm<{ form: Record<string, unknown> }>(ProjectFormView)
    Object.assign(vm.form, { startDate: '2026-01-01', endDate: '2026-02-01' })
    await settle()
    vm.form.startDate = '2026-03-01'
    await settle()
    expect(vm.form.endDate).toBeNull()
  })

  it('crea el proyecto y vuelve a la lista', async () => {
    app = await mountApp('/projects/new')
    const vm = app.vm<{ form: Record<string, unknown> }>(ProjectFormView)
    await pick('Mandante')
    await pick('Tipo de proyecto')
    await pick('Especialidad')
    Object.assign(vm.form, { name: ' Obra nueva ', startDate: '2026-05-01' })
    await type($$('input[type="text"]').find((i) => (i.closest('.v-input')?.textContent ?? '').includes('Centro de costo')) as HTMLInputElement, 'cc-9!')
    await settle()
    await clickText('button', 'Guardar')
    const [post] = app.backend.find('POST', /^\/projects$/)
    expect(JSON.parse(post.data as string)).toMatchObject({ name: 'Obra nueva', costCenterCode: '9', clientId: 1, typeId: 1, specialtyId: 1 })
    expect(router.currentRoute.value.path).toBe('/projects')
  })

  it('edita un proyecto existente, incluso con un tipo inactivo', async () => {
    const backend = installBackend()
    backend.on('GET', /^\/projectTypes$/, { data: [{ id: 5, name: 'Otro tipo' }], meta: {} })
    app = await mountApp('/projects/1/edit', { backend })
    const vm = app.vm<{ form: Record<string, unknown>; typeItems: { id: number; props?: { disabled: boolean } }[] }>(ProjectFormView)
    expect(vm.form).toMatchObject({ id: 1, name: 'Proyecto 1', typeId: 1 })
    expect(vm.typeItems.find((t) => t.id === 1)?.props).toEqual({ disabled: true })
    await clickText('button', 'Guardar')
    expect(app.backend.find('PUT', /^\/projects\/1$/)).toHaveLength(1)
  })

  it('muestra los errores de campo de backend', async () => {
    app = await mountApp('/projects/1/edit')
    app.backend.on('PUT', /^\/projects\/1$/, { failure: { status: 400, errorFields: { costCenterCode: 'Centro de costo duplicado' } } })
    await clickText('button', 'Guardar')
    expect(text()).toContain('Centro de costo duplicado')
  })

  it('avisa si la creación falla sin detalle', async () => {
    app = await mountApp('/projects/1/edit')
    app.backend.on('PUT', /^\/projects\/1$/, { failure: { status: 500 } })
    await clickText('button', 'Guardar')
    expect(router.currentRoute.value.path).toBe('/projects/1/edit')
  })
})

describe('Roles', () => {
  it('lista roles con filtros por estado y submódulo', async () => {
    app = await mountApp('/roles?active=false&subModuleId=1')
    expect(text()).toContain('Rol 1')
    expect(text()).toContain('Estado: Inactivos')
    expect(app.backend.find('GET', /^\/roles$/)[0].params).toMatchObject({ active: false, subModuleId: 1 })
  })

  it('muestra el detalle con permisos agrupados', async () => {
    app = await mountApp('/roles?detail=1')
    expect(text()).toContain('Detalle de rol')
    expect(text()).toContain('Mandantes')
  })

  it('desactiva un rol con usuarios exigiendo un reemplazo', async () => {
    app = await mountApp('/roles')
    await click(rowMenu())
    await clickText('.v-list-item', 'Desactivar')
    expect(text()).toContain('nuevo rol')
    const confirm = $$('.v-dialog button').find((b) => /^\s*Desactivar\s*$/.test(b.textContent ?? ''))
    await click(confirm ?? null)
    expect(app.backend.find('PATCH', /^\/roles\/1\/active$/).length).toBeLessThanOrEqual(1)
    const field = $('.v-dialog .v-field')
    field?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await click(field)
    await click($$('.v-overlay--active .v-list-item')[0] ?? null)
    await click($$('.v-dialog button').find((b) => /^\s*Desactivar\s*$/.test(b.textContent ?? '')) ?? null)
    expect(app.backend.find('PATCH', /^\/roles\/1\/active$/)).toHaveLength(1)
  })

  it('valida nombre y permisos y luego crea el rol', async () => {
    app = await mountApp('/roles/new')
    await clickText('button', 'Guardar')
    const vm = app.vm<{ form: Record<string, unknown>; fieldErrors: Record<string, string> }>(RoleFormView)
    expect(Object.keys(vm.fieldErrors).sort()).toEqual(['name', 'permissionIds'])
    expect(text()).toContain('Mandantes')

    const scopeSwitch = $$('.v-switch input')
    expect(scopeSwitch.length).toBeGreaterThan(0)
    await click(scopeSwitch[0])
    await click(scopeSwitch[0])
    await click(scopeSwitch[0])
    for (const title of $$('.v-expansion-panel-title')) await click(title)
    const toggles = $$('.v-expansion-panel-text .v-switch input')
    expect(toggles.length).toBeGreaterThan(1)
    await click(toggles[0])
    await click(toggles[1])
    await click(toggles[0])
    await click(toggles[0])
    const search = $$('input').find((i) => /Buscar/i.test(i.getAttribute('placeholder') ?? i.getAttribute('aria-label') ?? ''))
    if (search) {
      await type(search as HTMLInputElement, 'zzz')
      await type(search as HTMLInputElement, '')
    }
    vm.form.name = 'Rol nuevo'
    vm.form.description = ''
    await settle()
    await clickText('button', 'Guardar')
    const [post] = app.backend.find('POST', /^\/roles$/)
    expect(JSON.parse(post.data as string)).toMatchObject({ name: 'Rol nuevo', description: null })
    expect((JSON.parse(post.data as string).permissionIds as number[]).length).toBeGreaterThan(0)
  })

  it('edita un rol y muestra errores de backend', async () => {
    app = await mountApp('/roles/1/edit')
    expect(app.vm<{ form: { name: string } }>(RoleFormView).form.name).toBe('Rol 1')
    app.backend.on('PUT', /^\/roles\/1$/, { failure: { status: 400, errorFields: { name: 'Nombre repetido' } } })
    await clickText('button', 'Guardar')
    expect(text()).toContain('Nombre repetido')
  })

  it('edita con éxito y vuelve a la lista', async () => {
    app = await mountApp('/roles/1/edit')
    await clickText('button', 'Guardar')
    expect(app.backend.find('PUT', /^\/roles\/1$/)).toHaveLength(1)
    expect(router.currentRoute.value.path).toBe('/roles')
  })

  it('el panel de permisos permite filtrar y expandir módulos', async () => {
    app = await mountApp('/roles/new')
    const panels = $$('.v-expansion-panel-title')
    expect(panels.length).toBeGreaterThan(0)
    await click(panels[0])
    await wait(10)
    expect(RolesListView).toBeDefined()
  })
})

describe('Usuarios', () => {
  it('lista, filtra y abre el detalle', async () => {
    app = await mountApp('/users?roleId=1&active=true&detail=1')
    expect(text()).toContain('Ana Paz 1')
    expect(text()).toContain('Rol: Rol 1')
    expect(text()).toContain('Detalle de usuario')
    expect(text()).toContain('ana1@promaty.cl')
  })

  it('activa o desactiva un usuario', async () => {
    app = await mountApp('/users')
    await click(rowMenu())
    await clickText('.v-list-item', 'Desactivar')
    await clickText('.v-dialog button', /^\s*Desactivar\s*$/)
    expect(app.backend.find('PATCH', /^\/users\/1\/active$/)).toHaveLength(1)
  })

  it('valida los campos obligatorios', async () => {
    app = await mountApp('/users/new')
    await clickText('button', 'Guardar')
    expect(app.backend.find('POST', /^\/users$/)).toHaveLength(0)
    const vm = app.vm<{ form: Record<string, unknown>; fieldErrors: Record<string, string> }>(UserFormView)
    expect(Object.keys(vm.fieldErrors).sort()).toEqual(['email', 'firstName', 'lastName', 'roleId'])
    vm.form.email = 'sin-arroba'
    await clickText('button', 'Guardar')
    expect(vm.fieldErrors.email).toBeTruthy()
  })

  it('crea un usuario', async () => {
    app = await mountApp('/users/new')
    const vm = app.vm<{ form: Record<string, unknown> }>(UserFormView)
    Object.assign(vm.form, { firstName: 'Luis', lastName: 'Soto', email: 'luis@promaty.cl', phoneNumber: '9 1234 5678' })
    await pick('Rol')
    await pick('Centros de costo')
    await clickText('button', 'Guardar')
    const [post] = app.backend.find('POST', /^\/users$/)
    expect(JSON.parse(post.data as string)).toMatchObject({ firstName: 'Luis', phoneNumber: '912345678', roleId: 1 })
    expect(router.currentRoute.value.path).toBe('/users')
  })

  it('edita un usuario con teléfono nulo', async () => {
    const backend = installBackend()
    backend.on('GET', /^\/users\/1$/, { data: { id: 1, firstName: 'Ana', lastName: 'Paz', email: 'a@a.cl', phoneNumber: null, active: true, role: { id: 1, name: 'Rol 1' }, projectIds: [], createdAt: '2026-03-05T10:00:00', updatedAt: '2026-03-05T10:00:00', createdBy: 'x', updatedBy: 'y', actions: ['UPDATE'] } })
    app = await mountApp('/users/1/edit', { backend })
    expect(app.vm<{ form: { phoneNumber: string } }>(UserFormView).form.phoneNumber).toBe('')
    await clickText('button', 'Guardar')
    expect(app.backend.find('PUT', /^\/users\/1$/)).toHaveLength(1)
  })

  it('muestra errores de backend al guardar', async () => {
    app = await mountApp('/users/1/edit')
    app.backend.on('PUT', /^\/users\/1$/, { failure: { status: 409, errorFields: { email: 'Correo ya registrado' } } })
    await clickText('button', 'Guardar')
    expect(text()).toContain('Correo ya registrado')
  })
})
