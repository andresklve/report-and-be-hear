// Utilidades de presentacion compartidas (estados, iconos, formatos)

export type Tono = 'warn' | 'info' | 'ok' | 'bad' | 'neutral';

export interface EstadoInfo { key: string; label: string; tono: Tono; paso: number; icono: string; }

export const ESTADOS: EstadoInfo[] = [
  { key: 'PENDIENTE', label: 'Recibido', tono: 'warn', paso: 1, icono: 'inbox' },
  { key: 'EN_PROCESO', label: 'En atención', tono: 'info', paso: 2, icono: 'construction' },
  { key: 'RESUELTO', label: 'Resuelto', tono: 'ok', paso: 3, icono: 'task_alt' },
  { key: 'RECHAZADO', label: 'Descartado', tono: 'bad', paso: 0, icono: 'block' },
];

export function estadoInfo(key: string | null | undefined): EstadoInfo {
  return ESTADOS.find(e => e.key === key)
    ?? (key === 'APROBADO'
      ? { key: 'APROBADO', label: 'Aprobado', tono: 'info', paso: 2, icono: 'verified' }
      : { key: key ?? '', label: key ?? '—', tono: 'neutral', paso: 0, icono: 'help' });
}

// Icono de Material Symbols segun el nombre de la categoria
export function iconoCategoria(nombre: string | null | undefined): string {
  const n = (nombre ?? '').toLowerCase();
  if (/bache|pista|vered|vía|via|calle/.test(n)) return 'add_road';
  if (/luz|alumbr|poste/.test(n)) return 'emoji_objects';
  if (/basura|residuo|limpie/.test(n)) return 'delete';
  if (/segur|robo|delinc/.test(n)) return 'shield_person';
  if (/agua|desag|fuga/.test(n)) return 'water_drop';
  if (/parque|verde|árbol|arbol/.test(n)) return 'park';
  if (/ruido/.test(n)) return 'volume_up';
  if (/tráns|trans|tránsito|semáfor/.test(n)) return 'traffic';
  return 'campaign';
}

export function soles(v: number | null | undefined): string {
  const n = Number(v ?? 0);
  return 'S/ ' + n.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Tiempo legible a partir de dias (el backend devuelve dias con decimales)
export function duracion(dias: number | null | undefined): string {
  if (dias == null) return '—';
  const min = dias * 24 * 60;
  if (min < 1) return '< 1 min';
  if (min < 60) return `${Math.round(min)} min`;
  if (min < 60 * 24) return `${(min / 60).toFixed(1)} h`;
  return `${dias.toFixed(1)} días`;
}

export function referencia(id: number): string {
  return 'RYA-' + String(id).padStart(4, '0');
}
