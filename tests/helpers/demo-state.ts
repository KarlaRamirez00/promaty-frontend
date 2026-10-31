import * as fs from 'fs';
import * as path from 'path';
import type { DemoStaff } from './demo-data';
import { STATE_FILE } from './paths';

/** Estado compartido entre los comandos de la demo. */
interface DemoState {
  /** Colaborador creado por `demo:colaborador`, al que `demo:contrato` le solicita el contrato. */
  staff?: DemoStaff;
}

export function readState(): DemoState {
  if (!fs.existsSync(STATE_FILE)) return {};
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) as DemoState;
}

export function writeState(patch: Partial<DemoState>): void {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify({ ...readState(), ...patch }, null, 2));
}

export function requireState<K extends keyof DemoState>(key: K, hint: string): NonNullable<DemoState[K]> {
  const value = readState()[key];
  if (!value) throw new Error(`Falta el estado "${key}". ${hint}`);
  return value as NonNullable<DemoState[K]>;
}
