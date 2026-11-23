// Formulario común de anulación (finiquitos y contratos): solo pide el motivo.
export interface AnnulForm {
  reason: string
}

export const createAnnulForm = (): AnnulForm => ({ reason: '' })

export const ANNUL_REASON_MAX_LENGTH = 250
