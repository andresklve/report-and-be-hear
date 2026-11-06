export class TestimonioDTO {
  idTestimonio: number = 0;
  idUsuario: number = 0;
  idCategoria: number = 0;
  idZona: number = 0;
  descripcionTexto: string = '';
  fotoUrl: string = '';
  direccionTextoExtraida: string = '';
  latitud: number = 0;
  longitud: number = 0;
  estado: string = 'PENDIENTE';
  confianzaIA: number | null = null;
  modeloIA: string | null = null;
}
