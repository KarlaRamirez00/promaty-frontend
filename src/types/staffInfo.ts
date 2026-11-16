export interface StaffInfoItem {
  // Ruta SVG de @mdi/js.
  icon: string
  label: string
  value: string
  // Resalta el valor: se usa en los datos que condicionan lo que el usuario va a completar.
  emphasis?: boolean
}
