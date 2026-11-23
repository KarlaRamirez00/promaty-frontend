import { describe, expect, it } from 'vitest'
import { escapeHtml } from '@/utils'

describe('escapeHtml', () => {
  it('escapa los caracteres que abren marcado o atributos', () => {
    expect(escapeHtml(`<script>alert("x")</script> & 'y'`)).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;',
    )
  })

  it('deja intacto un texto sin caracteres especiales', () => {
    expect(escapeHtml('Rex+ rechazó el RUT')).toBe('Rex+ rechazó el RUT')
  })

  it('devuelve un texto vacío sin cambios', () => {
    expect(escapeHtml('')).toBe('')
  })
})
