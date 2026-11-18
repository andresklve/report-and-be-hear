export class ModeracionDTO {
  idModeracion: number = 0;
  idTestimonio: number = 0;
  idUsuarioAdmin: number = 0;
  accion: string = 'APROBADO';
  motivo: string = '';
  costo: number | null = null;
  fechaAccion: string | null = null;
}
