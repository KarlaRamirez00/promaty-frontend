export interface DemoStaff {
  /** Cuerpo y dígito verificador, sin puntos ni guion. */
  rut: string;
  rutFormatted: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  email: string;
  phone: string;
}

const FIRST_NAMES = ['Camila', 'Valentina', 'Francisca', 'Javiera', 'Constanza', 'Ignacio', 'Felipe', 'Diego'];
const LAST_NAMES = ['Fuentes', 'Contreras', 'Silva', 'Rojas', 'Morales', 'Araya', 'Tapia', 'Vergara'];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomDigits(length: number): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

function verifierDigit(body: string): string {
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  if (remainder === 11) return '0';
  if (remainder === 10) return 'K';
  return String(remainder);
}

export function buildDemoStaff(): DemoStaff {
  const body = String(10_000_000 + Math.floor(Math.random() * 15_000_000));
  const dv = verifierDigit(body);
  const firstName = pick(FIRST_NAMES);
  return {
    rut: `${body}${dv}`,
    rutFormatted: `${body.slice(0, 2)}.${body.slice(2, 5)}.${body.slice(5)}-${dv}`,
    firstName,
    paternalLastName: pick(LAST_NAMES),
    maternalLastName: pick(LAST_NAMES),
    email: `${firstName.toLowerCase()}.${body}@example.test`,
    phone: `9${randomDigits(8)}`,
  };
}

/** Coincide con el RUT escrito con o sin puntos y guion. */
export function rutPattern(rut: string): RegExp {
  return new RegExp(rut.split('').join('\\D*'), 'i');
}
