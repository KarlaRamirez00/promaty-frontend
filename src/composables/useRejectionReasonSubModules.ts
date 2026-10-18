import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { getRequestRejectionReasonSubModuleOptionsAction } from '@/actions'
import { NO_DATA } from '@/utils'

// Catálogo de submódulos de los motivos de rechazo: alimenta el selector, el filtro y los nombres mostrados.
export function useRejectionReasonSubModules() {
  const { data } = useQuery({
    queryKey: ['requestRejectionReasons', 'subModules'],
    queryFn: getRequestRejectionReasonSubModuleOptionsAction,
  })

  const options = computed(() =>
    (data.value ?? []).map((subModule) => ({ title: subModule.name, value: subModule.code })),
  )

  function nameOf(code: string): string {
    return data.value?.find((subModule) => subModule.code === code)?.name ?? NO_DATA
  }

  return { options, nameOf }
}
