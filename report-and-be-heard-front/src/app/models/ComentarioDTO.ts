export class ComentarioDTO {
  idComentario: number = 0;
  idTestimonio: number = 0;
  idUsuario: number = 0;
  texto: string = '';
  fechaCreacion: string | null = null;
  nombreAutor: string = '';   // solo lectura (lo arma el backend)
}
