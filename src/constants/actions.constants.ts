// Strings de máquina que el backend envía en el array "actions" de cada registro.
export const ACTION = {
  UPDATE: 'UPDATE',
  ACTIVE: 'ACTIVE',
  STATUS: 'STATUS',
  APPROVE: 'APPROVE',
  VALIDATE: 'VALIDATE',
} as const

export type Action = (typeof ACTION)[keyof typeof ACTION]
