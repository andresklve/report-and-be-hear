// Un problema distinto encontrado en el reclamo
export class OpcionCategoriaDTO {
  idCategoria: number = 0;
  nombreCategoria: string = '';
  confianza: number = 0;
  fragmento: string | null = null;
}

// Resultado de POST /apis/ia/clasificar
// Si variosProblemas = true, el ciudadano elige una de las opciones (un reporte = un problema)
export class ClasificacionIADTO {
  idCategoria: number | null = null;
  nombreCategoria: string | null = null;
  direccionTextoExtraida: string | null = null;
  confianzaIA: number = 0;
  modeloIA: string = '';
  opciones: OpcionCategoriaDTO[] = [];
  variosProblemas: boolean = false;
}
