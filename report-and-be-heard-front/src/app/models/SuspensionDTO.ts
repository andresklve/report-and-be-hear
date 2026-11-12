export type MotivoSuspension = 'COMENTARIO_OFENSIVO' | 'REPORTE_FALSO' | 'OTRO';

export class SuspensionDTO {
  idSuspension: number = 0;
  idUsuario: number = 0;
  idUsuarioModerador: number = 0;
  motivo: MotivoSuspension = 'COMENTARIO_OFENSIVO';
  detalle: string = '';
  dias: number | null = null;   // solo al registrar; null = indefinida
  fechaInicio: string | null = null;
  fechaFin: string | null = null;
  activa: boolean = true;
  // solo lectura
  vigente: boolean = true;
  nombreUsuario: string = '';
  correoUsuario: string = '';
}

export const MOTIVOS_SUSPENSION: { key: MotivoSuspension; label: string }[] = [
  { key: 'COMENTARIO_OFENSIVO', label: 'Comentarios ofensivos' },
  { key: 'REPORTE_FALSO', label: 'Reporte falso' },
  { key: 'OTRO', label: 'Otro motivo' },
];
