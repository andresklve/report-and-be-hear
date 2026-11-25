// Resultado de POST /apis/ia/clasificar
export class ClasificacionIADTO {
  idCategoria: number | null = null;
  nombreCategoria: string | null = null;
  direccionTextoExtraida: string | null = null;
  confianzaIA: number = 0;
  modeloIA: string = '';
}
