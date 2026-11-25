export class MapaCalorDTO {
  idZona: number = 0;
  nombreZona: string = '';
  latitudZona: number = 0;
  longitudZona: number = 0;
  densidad: number = 0;
}

export class CategoriaReporteDTO {
  idCategoria: number = 0;
  nombreCategoria: string = '';
  cantidadTestimonios: number = 0;
}

export class RankingZonaDTO {
  idZona: number = 0;
  nombreZona: string = '';
  totalTestimonios: number = 0;
}

export class TendenciaTemporalDTO {
  periodo: string = '';
  totalTestimonios: number = 0;
}

export class InversionDepartamentoDTO {
  departamento: string = '';
  totalInversion: number = 0;
}

export class CostoCategoriaDTO {
  categoria: string = '';
  totalCosto: number = 0;
}

export class TiempoAtencionDTO {
  diasPromedio: number | null = null;
}

export class DesempenoIADTO {
  nombreCategoria: string = '';
  modeloIA: string = '';
  confianzaPromedio: number = 0;
}
