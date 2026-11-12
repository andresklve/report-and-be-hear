export type TipoNotificacion = 'ESTADO' | 'COMENTARIO' | 'SUSPENSION';

export class NotificacionDTO {
  idNotificacion: number = 0;
  idUsuario: number = 0;
  idTestimonio: number | null = null;
  tipo: TipoNotificacion = 'ESTADO';
  mensaje: string = '';
  leida: boolean = false;
  fechaCreacion: string | null = null;
}
