export class LoginRequestDTO {
  username: string = '';
  password: string = '';
}

export class LoginResponseDTO {
  token: string = '';
  username: string = '';
}

export type RolNombre = 'ADMINISTRADOR' | 'MUNICIPALIDAD' | 'CIUDADANO';

export class SesionDTO {
  token: string = '';
  idUsuario: number = 0;
  nombres: string = '';
  apellidos: string = '';
  correo: string = '';
  rol: RolNombre = 'CIUDADANO';
}
