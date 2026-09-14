import {
  mdiAccountGroupOutline,
  mdiAccountMultipleOutline,
  mdiAccountSearchOutline,
  mdiCalendarAccountOutline,
  mdiCalendarClockOutline,
  mdiCashClock,
  mdiCashMultiple,
  mdiClipboardTextOutline,
  mdiFileDocumentRemoveOutline,
  mdiFilePlusOutline,
  mdiFileSign,
  mdiMedicalBag,
  mdiSwapHorizontal,
} from '@mdi/js'
import type { MenuItem } from '@/data/menu/menu.types'

// Solicitudes es el único submódulo con ruta real hoy (datos mock). El resto son placeholders sin
// `to`, listados a propósito para mostrar el mapa completo de módulos por construir.
export const hrMenu: MenuItem = {
  title: 'RRHH',
  icon: mdiAccountGroupOutline,
  submenu: [
    { title: 'Solicitudes', icon: mdiClipboardTextOutline, to: '/requests' },
    { title: 'Anexos', icon: mdiFilePlusOutline },
    { title: 'Anticipos', icon: mdiCashClock },
    { title: 'Colaboradores', icon: mdiAccountMultipleOutline },
    { title: 'Contratos', icon: mdiFileSign },
    { title: 'Control de asistencia', icon: mdiCalendarClockOutline },
    { title: 'Finiquitos', icon: mdiFileDocumentRemoveOutline },
    { title: 'Licencias Médicas', icon: mdiMedicalBag },
    { title: 'Permisos', icon: mdiCalendarAccountOutline },
    { title: 'Reclutamiento', icon: mdiAccountSearchOutline },
    { title: 'Sueldos', icon: mdiCashMultiple },
    { title: 'Traspasos', icon: mdiSwapHorizontal },
  ],
}
