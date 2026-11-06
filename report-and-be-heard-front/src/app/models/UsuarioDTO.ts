export class UsuarioDTO {
  idUsuario: number = 0;
  nombres: string = '';
  apellidos: string = '';
  correo: string = '';
  passwordHash: string = '';
  idRol: number = 0;
  fechaRegistro: string | null = null;
  activo: boolean = true;
}
