import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores'

// Resuelve permisos de acción (crear/editar/activar) contra el módulo de la ruta actual.
// Ej.: en /clients (meta.module: 'client'), hasPermission('create') evalúa 'client.create'.
export function usePermissions() {
  const route = useRoute()
  const auth = useAuthStore()

  function hasPermission(permission: string): boolean {
    if (!route.meta.module) return false
    return auth.permissions.includes(`${route.meta.module}.${permission}`)
  }

  // Misma evaluación que hasPermission, pero contra un módulo explícito en vez del de la ruta
  // actual — para filtrar ítems de sidebar (data/menu/), que no viven en la ruta activa.
  function hasModulePermission(module: string, permission: string): boolean {
    return auth.permissions.includes(`${module}.${permission}`)
  }

  return { hasPermission, hasModulePermission }
}
