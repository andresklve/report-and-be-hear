package pe.edu.upc.reportandbeheard.servicesinterfaces;

import pe.edu.upc.reportandbeheard.dtos.CategoriaReporteDTO;
import pe.edu.upc.reportandbeheard.dtos.DesempenoIADTO;
import pe.edu.upc.reportandbeheard.dtos.MapaCalorDTO;
import pe.edu.upc.reportandbeheard.dtos.RankingZonaDTO;
import pe.edu.upc.reportandbeheard.dtos.TendenciaTemporalDTO;

import java.util.List;

public interface IReporteService {
    List<MapaCalorDTO> mapaCalorPorZona();

    List<CategoriaReporteDTO> reportePorCategoria();

    List<TendenciaTemporalDTO> tendenciaTemporal(String agrupacion);

    List<RankingZonaDTO> rankingZonas();

    List<DesempenoIADTO> desempenoIA();
}
