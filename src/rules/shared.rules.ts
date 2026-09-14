// InputMasks reutilizables entre dominios: transforman el valor tecleado, no validan el envío
// (para eso están los Validator de validators.ts). Se agregan acá solo cuando un formulario
// real los necesita — no portar todo el catálogo de otro proyecto por si acaso.

// InputMask genérico para solo números con longitud máxima.
export function inputMaskNumbers(value: string, maxLength: number): string {
  return value.replace(/\D/g, '').slice(0, maxLength)
}
