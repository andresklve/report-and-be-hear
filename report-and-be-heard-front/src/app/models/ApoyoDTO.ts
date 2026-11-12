export class ApoyoDTO {
  idApoyo: number = 0;
  idTestimonio: number = 0;
  idUsuario: number = 0;
  fechaApoyo: string | null = null;
}

export class ApoyoResumenDTO {
  idTestimonio: number = 0;
  totalApoyos: number = 0;
  apoyadoPorUsuario: boolean = false;
}

export class RankingApoyoDTO {
  idTestimonio: number = 0;
  totalApoyos: number = 0;
}
