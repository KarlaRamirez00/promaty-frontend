export interface DetailField {
  key: string
  label: string
  value?: string | number
}

export interface DetailSection {
  key: string
  // Texto de la pestaña.
  tab: string
  // Título de la sección dentro de la pestaña.
  title: string
  fields: DetailField[]
}
