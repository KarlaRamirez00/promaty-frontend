import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { authApi, rrhhApi, userApi } from '@/lib/http'
import * as fx from './fixtures'

export interface BackendRequest {
  method: string
  path: string
  params: Record<string, unknown>
  data: unknown
}

export interface BackendFailure {
  failure: { status: number; name?: string; message?: string; errorFields?: Record<string, string>; meta?: object }
}

type Reply = unknown | BackendFailure
type Handler = (request: BackendRequest, match: RegExpMatchArray) => Reply

const page = (items: unknown[], extra: object = {}) => ({
  data: items,
  meta: { pagination: { page: 0, size: 10, total: items.length, pageCount: 1 }, ...extra },
})
const single = (data: unknown) => ({ data, error: null, meta: {} })
const many = (n: number, make: (id: number) => unknown) => Array.from({ length: n }, (_, i) => make(i + 1))
const catalog = () => page([fx.named(1), fx.named(2), fx.named(3)])

const STATUS_BY_SUBMODULE: Record<string, unknown[]> = {
  request: fx.STATUSES.request,
  contract: fx.STATUSES.contract,
  staff: fx.STATUSES.staff,
  project: fx.STATUSES.project,
  termination: fx.STATUSES.request,
  annex: fx.STATUSES.request,
}

// Rutas en orden de prioridad: las más específicas primero.
function defaultRoutes(): [string, RegExp, Handler][] {
  const list = (re: RegExp, make: (id: number) => unknown, extra: object = {}): [string, RegExp, Handler] => [
    'GET',
    re,
    () => page(many(3, make), extra),
  ]
  const detail = (re: RegExp, make: (id: number) => unknown): [string, RegExp, Handler] => [
    'GET',
    re,
    (_req, match) => single(make(Number(match[1]))),
  ]
  return [
    ['POST', /^\/auth\/login$/, () => single({ token: 'ignored' })],
    ['POST', /^\/auth\//, () => single(null)],

    ['GET', /^\/staff\/selector\/annexable$/, () => page([fx.annexableStaff(1), fx.annexableStaff(2)])],
    ['GET', /^\/staff\/selector\/terminable$/, () =>
      page([{ id: 1, name: 'Ana Paz Rojas', identificationNumber: '12345678-5', minTerminationDate: '2026-01-01', maxTerminationDate: '2026-12-31' }])],
    ['GET', /^\/staff\/selector$/, () => page([{ id: 1, name: 'Ana Paz Rojas', identificationNumber: '12345678-5' }])],
    list(/^\/staff$/, fx.staffList),
    detail(/^\/staff\/(\d+)$/, (id) => fx.staff(id)),
    ['GET', /^\/banks$/, () => page([{ ...fx.named(1, 'Banco Estado'), code: 'BANCO_ESTADO', supportsRutAccount: true }, { ...fx.named(2, 'Otro'), supportsRutAccount: false }])],

    ['GET', /^\/clients\/selector$/, () => page(many(3, fx.client))],
    ['GET', /^\/projectTypes\/selector$/, () => page(many(3, fx.projectType))],
    ['GET', /^\/projectSpecialties\/selector$/, () => page(many(3, fx.projectSpecialty))],
    ['GET', /^\/nonRehireReasons\/selector$/, () => page(many(3, fx.nonRehireReason))],
    list(/^\/clients$/, fx.client),
    detail(/^\/clients\/(\d+)$/, (id) => fx.client(id)),
    list(/^\/projectTypes$/, fx.projectType),
    detail(/^\/projectTypes\/(\d+)$/, (id) => fx.projectType(id)),
    list(/^\/projectSpecialties$/, fx.projectSpecialty),
    detail(/^\/projectSpecialties\/(\d+)$/, (id) => fx.projectSpecialty(id)),
    ['GET', /^\/projects\/selector$/, () => page([{ id: 1, name: 'Proyecto 1', costCenterCode: 'CC-1' }, { id: 2, name: 'Proyecto 2', costCenterCode: 'CC-2' }])],
    ['GET', /^\/projects\/options$/, () => page([{ id: 1, name: 'Proyecto 1', code: 'CC-1' }, { id: 2, name: 'Proyecto 2', code: 'CC-2' }])],
    list(/^\/projects$/, fx.project),
    detail(/^\/projects\/(\d+)$/, fx.project),
    list(/^\/nonRehireReasons$/, fx.nonRehireReason),
    detail(/^\/nonRehireReasons\/(\d+)$/, (id) => fx.nonRehireReason(id)),
    ['GET', /^\/requestRejectionReasons\/subModules$/, () => page([{ id: 1, name: 'contracts', alias: 'Contratos' }, { id: 2, name: 'terminations', alias: 'Finiquitos' }])],
    ['GET', /^\/requestRejectionReasons\/selector$/, () => page([fx.named(1, 'Falta documentación'), fx.named(2, 'Datos erróneos')])],
    list(/^\/requestRejectionReasons$/, fx.rejectionReason),
    detail(/^\/requestRejectionReasons\/(\d+)$/, (id) => fx.rejectionReason(id)),

    ['GET', /^\/permissions$/, () => page(fx.PERMISSIONS)],
    ['GET', /^\/roles\/selector$/, () => page([fx.named(1, 'Rol 1'), fx.named(2, 'Rol 2')])],
    list(/^\/roles$/, fx.role),
    detail(/^\/roles\/(\d+)$/, (id) => fx.role(id)),
    list(/^\/users$/, fx.user),
    detail(/^\/users\/(\d+)$/, (id) => fx.user(id)),

    ['GET', /^\/requests\/requesters$/, () => page([{ id: 1, name: 'Ana Paz' }, { id: 2, name: 'Luis Soto' }])],
    list(/^\/requests$/, fx.request, { otherData: { pendingApproval: 2, pendingValidation: 1 } }),
    detail(/^\/requests\/(\d+)$/, fx.requestDetail),
    ['PATCH', /^\/requests\/\d+\/retrySync$/, () => single({ synced: true, syncErrorMessage: null })],
    ['GET', /^\/contractTypes$/, () => page([{ id: 1, name: 'Plazo fijo', code: 'F' }, { id: 2, name: 'Indefinido', code: 'I' }])],
    list(/^\/contracts$/, fx.contractList, { otherData: { expiringSoon: 2, expired: 1, expiringSoonDays: 30 } }),
    detail(/^\/contracts\/(\d+)$/, fx.contract),
    list(/^\/terminations$/, fx.termination),
    detail(/^\/terminations\/(\d+)$/, fx.termination),
    list(/^\/annexes$/, fx.annex),
    detail(/^\/annexes\/(\d+)$/, (id) => fx.annex(id)),
    ['GET', /^\/annexTypes$/, () =>
      page([
        { id: 1, name: 'Prórroga', code: 'CONTRACT_EXTENSION' },
        { id: 2, name: 'Conversión', code: 'CONVERSION_TO_INDEFINITE' },
        { id: 3, name: 'Aumento de sueldo', code: 'SALARY_INCREASE' },
        { id: 4, name: 'Cambio de cargo', code: 'JOB_TITLE_CHANGE' },
        { id: 5, name: 'Horario o sucursal', code: 'SCHEDULE_OR_SITE_CHANGE' },
      ])],
    ['GET', /^\/legalTerminationCauses$/, () =>
      page([
        { id: 1, name: 'Necesidades de la empresa', code: 'N', requiresAttachment: false, attachmentLabel: null },
        { id: 2, name: 'Renuncia', code: 'R', requiresAttachment: true, attachmentLabel: 'Carta de renuncia' },
      ])],
    ['GET', /^\/platformStatuses$/, (req) => page(STATUS_BY_SUBMODULE[String(req.params.subModule)] ?? fx.STATUSES.request)],
    ['GET', /^\/settings$/, () =>
      page([fx.setting('expiringDays', 'INTEGER'), fx.setting('ratio', 'DECIMAL'), fx.setting('enabled', 'BOOLEAN', 'general')])],
    ['PUT', /^\/settings\/(\w+)$/, (req, match) => single({ ...fx.setting(match[1], 'INTEGER'), value: (req.data as { value: string }).value })],
    ['GET', /^\/dashboard\/summary$/, () => single(fx.dashboardSummary())],
    ['GET', /^\/dashboard\/birthdays$/, (req) => {
      const month = Number(req.params.month ?? 11)
      return page(fx.BIRTHDAYS.filter((item) => item.month === month))
    }],
    ['GET', /^\/files\//, () => new Blob(['contenido'])],

    ['GET', /^\/(banks|companies|contractTypes|jobTitles|sites|mealTypes|transportTypes|registeredSexes|maritalStatuses|nationalities|educationLevels|afps|healthSystems|regions|provincias|comunas)$/, () => catalog()],

    ['POST', /^\//, () => single(99)],
    ['PUT', /^\//, () => single({})],
    ['PATCH', /^\/roles\/\d+\/active$/, () => single({ id: 1, active: false, reassignedUsers: 0 })],
    ['PATCH', /^\//, () => single({})],
    ['DELETE', /^\//, () => single(null)],
  ]
}

function isFailure(reply: Reply): reply is BackendFailure {
  return typeof reply === 'object' && reply !== null && 'failure' in reply
}

// Backend falso: responde por método y ruta con los fixtures y registra cada llamada. Los tests
// agregan respuestas puntuales con `on` (que tienen prioridad) o provocan errores con `{ failure }`.
export function installBackend() {
  const calls: BackendRequest[] = []
  const overrides: [string, RegExp, Handler][] = []
  const routes = defaultRoutes()

  const adapter: AxiosAdapter = (config: InternalAxiosRequestConfig) => {
    const method = String(config.method).toUpperCase()
    const path = String(config.url).split('?')[0]
    const request: BackendRequest = { method, path, params: (config.params ?? {}) as Record<string, unknown>, data: config.data }
    calls.push(request)

    for (const [routeMethod, pattern, handler] of [...overrides, ...routes]) {
      const match = routeMethod === method ? path.match(pattern) : null
      if (!match) continue
      const reply = handler(request, match)
      if (isFailure(reply)) {
        const { status, name = 'ERROR', message = 'Error de prueba', errorFields = null, meta = {} } = reply.failure
        const response = { status, statusText: '', headers: {}, config, data: { data: null, error: { status, name, message, errorFields }, meta } } as AxiosResponse
        return Promise.reject(new AxiosError(message, undefined, config, null, response))
      }
      return Promise.resolve({ status: 200, statusText: 'OK', headers: {}, config, data: reply } as AxiosResponse)
    }
    return Promise.resolve({ status: 200, statusText: 'OK', headers: {}, config, data: single(null) } as AxiosResponse)
  }

  for (const client of [authApi, rrhhApi, userApi]) client.defaults.adapter = adapter

  return {
    calls,
    on(method: string, pattern: RegExp, handler: Handler | Reply) {
      overrides.unshift([method.toUpperCase(), pattern, typeof handler === 'function' ? (handler as Handler) : () => handler])
    },
    find(method: string, pattern: RegExp) {
      return calls.filter((call) => call.method === method.toUpperCase() && pattern.test(call.path))
    },
    reset() {
      calls.length = 0
      overrides.length = 0
    },
  }
}

export type Backend = ReturnType<typeof installBackend>
export { page as pageOf, single as singleOf }
