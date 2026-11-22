import { vi } from 'vitest'

vi.stubEnv('VITE_API_URL', 'http://api.test')

// Las rutas se cargan de forma perezosa: con muchos archivos en paralelo el segundo por defecto no alcanza.
const waitForOriginal = vi.waitFor.bind(vi)
vi.waitFor = ((callback, options) =>
  waitForOriginal(callback, { timeout: 20_000, interval: 50, ...(typeof options === 'object' ? options : {}) })) as typeof vi.waitFor

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver

globalThis.visualViewport ??= {
  width: 1024,
  height: 768,
  addEventListener() {},
  removeEventListener() {},
} as unknown as VisualViewport

globalThis.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
  onchange: null,
})) as unknown as typeof matchMedia

globalThis.scrollTo = (() => {}) as typeof scrollTo
