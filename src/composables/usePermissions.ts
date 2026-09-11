import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Resuelve permisos de acción (crear/editar/activar) contra el módulo de la ruta actual.
// Ej.: en /clients (meta.module: 'client'), hasPermission('create') evalúa 'client.create'.
export function usePermissions() {
  const route = useRoute()
  const auth = useAuthStore()

  function hasPermission(permission: string): boolean {
    if (!route.meta.module) return false
    return auth.permissions.includes(`${route.meta.module}.${permission}`)
  }

  return { hasPermission }
}
