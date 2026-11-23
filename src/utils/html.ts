const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

// Escapa un texto externo (por ejemplo, un mensaje de error de Rex+) antes de pasarlo a un componente
// que renderiza HTML, para que nunca se interprete como marcado.
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char])
}
