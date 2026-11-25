// Apoyo para los graficos hechos con ng2-charts (Chart.js), como en el curso.
import { Chart } from 'chart.js';

// Los graficos usan la misma letra que la app
Chart.defaults.font.family = "'Roboto', system-ui, sans-serif";

// Un dato de un grafico: etiqueta, valor y (opcional) su texto y color
export interface Barra { label: string; valor: number; texto?: string; color?: string; }
export interface Porcion { label: string; valor: number; color: string; texto?: string; }

// Chart.js dibuja en un <canvas> y no entiende variables CSS como 'var(--chart-dinero)',
// asi que aqui se traducen al color real definido en styles.css.
export function colorReal(c: string | null | undefined, respaldo = '#41474F'): string {
  if (!c) return respaldo;
  const m = /^var\((--[\w-]+)\)$/.exec(c.trim());
  if (!m) return c;
  if (typeof document === 'undefined') return respaldo;   // en el servidor (SSR) no hay estilos
  const v = getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim();
  return v || respaldo;
}
