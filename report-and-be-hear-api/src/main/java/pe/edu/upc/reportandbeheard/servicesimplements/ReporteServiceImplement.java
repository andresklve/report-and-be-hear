package pe.edu.upc.reportandbeheard.servicesimplements;

import org.springframework.stereotype.Service;
import pe.edu.upc.reportandbeheard.dtos.CategoriaReporteDTO;
import pe.edu.upc.reportandbeheard.dtos.DesempenoIADTO;
import pe.edu.upc.reportandbeheard.dtos.MapaCalorDTO;
import pe.edu.upc.reportandbeheard.dtos.RankingZonaDTO;
import pe.edu.upc.reportandbeheard.dtos.TendenciaTemporalDTO;
import pe.edu.upc.reportandbeheard.repositories.ITestimonioRepository;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IReporteService;

import java.util.List;

@Service
public class ReporteServiceImplement implements IReporteService {
    private final ITestimonioRepository tR;

    public ReporteServiceImplement(ITestimonioRepository tR) {
        this.tR = tR;
    }

    @Override
    public List<MapaCalorDTO> mapaCalorPorZona() {
        return tR.mapaCalorPorZona();
    }

    @Override
    public List<CategoriaReporteDTO> reportePorCategoria() {
        return tR.reportePorCategoria();
    }

    @Override
    public List<TendenciaTemporalDTO> tendenciaTemporal(String agrupacion) {
        List<Object[]> resultados = "mes".equalsIgnoreCase(agrupacion)
                ? tR.contarPorMes()
                : tR.contarPorDia();

        return resultados.stream()
                .map(row -> new TendenciaTemporalDTO(
                        row[0].toString(),
                        ((Number) row[1]).longValue()))
                .toList();
    }

    @Override
    public List<RankingZonaDTO> rankingZonas() {
        return tR.rankingZonas();
    }

    @Override
    public List<DesempenoIADTO> desempenoIA() {
        return tR.desempenoIA();
    }
}
