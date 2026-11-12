package pe.edu.upc.reportandbeheard.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.upc.reportandbeheard.dtos.CategoriaReporteDTO;
import pe.edu.upc.reportandbeheard.dtos.CostoCategoriaDTO;
import pe.edu.upc.reportandbeheard.dtos.DesempenoIADTO;
import pe.edu.upc.reportandbeheard.dtos.InversionDepartamentoDTO;
import pe.edu.upc.reportandbeheard.dtos.MapaCalorDTO;
import pe.edu.upc.reportandbeheard.dtos.RankingZonaDTO;
import pe.edu.upc.reportandbeheard.dtos.TendenciaTemporalDTO;
import pe.edu.upc.reportandbeheard.dtos.TiempoAtencionDTO;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IModeracionService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IReporteService;

import java.util.List;

@RestController
@RequestMapping("/apis/reportes")
public class ReporteController {
    private final IReporteService rS;
    private final IModeracionService moderacionService;

    public ReporteController(IReporteService rS, IModeracionService moderacionService) {
        this.rS = rS;
        this.moderacionService = moderacionService;
    }

    @Operation(
            summary = "Visualizar inversión por departamento",
            description = "Suma los costos de moderación agrupados por departamento."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reporte obtenido correctamente")
    })
    @GetMapping("/inversion-por-departamento")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'MUNICIPALIDAD')")
    public ResponseEntity<List<InversionDepartamentoDTO>> obtenerInversionPorDepartamento() {
        return ResponseEntity.ok(moderacionService.obtenerInversionPorDepartamento());
    }

    @Operation(
            summary = "Visualizar costo por categoría",
            description = "Suma los costos de moderación agrupados por categoría."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reporte obtenido correctamente")
    })
    @GetMapping("/costo-por-categoria")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'MUNICIPALIDAD')")
    public ResponseEntity<List<CostoCategoriaDTO>> obtenerCostoPorCategoria() {
        return ResponseEntity.ok(moderacionService.obtenerCostoPorCategoria());
    }

    // US07: sin testimonios devuelve lista vacia con 200.
    @GetMapping("/mapa-calor")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'CIUDADANO', 'MUNICIPALIDAD')")
    public ResponseEntity<List<MapaCalorDTO>> mapaCalor() {
        return ResponseEntity.ok(rS.mapaCalorPorZona());
    }

    // US08: sin testimonios devuelve cada categoria con conteo 0 (200).
    @GetMapping("/por-categoria")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'CIUDADANO', 'MUNICIPALIDAD')")
    public ResponseEntity<List<CategoriaReporteDTO>> porCategoria() {
        return ResponseEntity.ok(rS.reportePorCategoria());
    }

    // US09: agrupacion "dia" (por defecto) o "mes".
    @GetMapping("/tendencia")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'MUNICIPALIDAD')")
    public ResponseEntity<List<TendenciaTemporalDTO>> tendenciaTemporal(
            @RequestParam(defaultValue = "dia") String agrupacion) {
        return ResponseEntity.ok(rS.tendenciaTemporal(agrupacion));
    }

    // US10: zonas ordenadas por cantidad de testimonios.
    @GetMapping("/ranking-zonas")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'MUNICIPALIDAD')")
    public ResponseEntity<List<RankingZonaDTO>> rankingZonas() {
        return ResponseEntity.ok(rS.rankingZonas());
    }

    // US13: sin moderaciones devuelve diasPromedio 0 con 200.
    @GetMapping("/tiempo-atencion")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'MUNICIPALIDAD')")
    public ResponseEntity<TiempoAtencionDTO> tiempoAtencion() {
        return ResponseEntity.ok(moderacionService.obtenerTiempoPromedioAtencion());
    }

    // US14: sin confianza de IA registrada devuelve lista vacia con 200.
    @GetMapping("/desempeno-ia")
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<List<DesempenoIADTO>> desempenoIA() {
        return ResponseEntity.ok(rS.desempenoIA());
    }
}
