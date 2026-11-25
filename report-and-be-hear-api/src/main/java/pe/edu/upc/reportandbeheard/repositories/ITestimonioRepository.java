package pe.edu.upc.reportandbeheard.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pe.edu.upc.reportandbeheard.dtos.CategoriaReporteDTO;
import pe.edu.upc.reportandbeheard.dtos.DesempenoIADTO;
import pe.edu.upc.reportandbeheard.dtos.MapaCalorDTO;
import pe.edu.upc.reportandbeheard.dtos.RankingZonaDTO;
import pe.edu.upc.reportandbeheard.entities.Testimonio;

import java.util.List;

@Repository
public interface ITestimonioRepository extends JpaRepository<Testimonio, Long> {
    // US07: testimonios agrupados por zona (JOIN), densidad = cantidad de testimonios.
    @Query("SELECT new pe.edu.upc.reportandbeheard.dtos.MapaCalorDTO(" +
            "z.idZona, z.nombreZona, z.latitudZona, z.longitudZona, COUNT(t)) " +
            "FROM Testimonio t JOIN t.zona z " +
            "GROUP BY z.idZona, z.nombreZona, z.latitudZona, z.longitudZona " +
            "ORDER BY COUNT(t) DESC")
    List<MapaCalorDTO> mapaCalorPorZona();

    // US08: conteo por categoria (JOIN testimonios-categorias). LEFT JOIN para devolver 0 en categorias sin testimonios.
    @Query("SELECT new pe.edu.upc.reportandbeheard.dtos.CategoriaReporteDTO(" +
            "c.idCategoria, c.nombreCategoria, COUNT(t)) " +
            "FROM Categoria c LEFT JOIN Testimonio t ON t.categoria = c " +
            "GROUP BY c.idCategoria, c.nombreCategoria " +
            "ORDER BY COUNT(t) DESC")
    List<CategoriaReporteDTO> reportePorCategoria();


    // US09: tendencia temporal por dia.
    @Query(value = "SELECT to_char(fecha_creacion, 'YYYY-MM-DD') AS periodo, COUNT(*) AS total " +
            "FROM testimonios GROUP BY periodo ORDER BY periodo", nativeQuery = true)
    List<Object[]> contarPorDia();

    // US09: tendencia temporal por mes.
    @Query(value = "SELECT to_char(fecha_creacion, 'YYYY-MM') AS periodo, COUNT(*) AS total " +
            "FROM testimonios GROUP BY periodo ORDER BY periodo", nativeQuery = true)
    List<Object[]> contarPorMes();

    // US10: ranking de zonas por cantidad de testimonios.
    @Query("SELECT new pe.edu.upc.reportandbeheard.dtos.RankingZonaDTO(" +
            "z.idZona, z.nombreZona, COUNT(t)) " +
            "FROM Testimonio t JOIN t.zona z " +
            "GROUP BY z.idZona, z.nombreZona " +
            "ORDER BY COUNT(t) DESC")
    List<RankingZonaDTO> rankingZonas();

    // US14: promedio de confianza de la IA por categoria y modelo (JOIN testimonios-categorias).
    @Query("SELECT new pe.edu.upc.reportandbeheard.dtos.DesempenoIADTO(" +
            "c.nombreCategoria, t.modeloIA, AVG(t.confianzaIA)) " +
            "FROM Testimonio t JOIN t.categoria c " +
            "WHERE t.confianzaIA IS NOT NULL " +
            "GROUP BY c.nombreCategoria, t.modeloIA " +
            "ORDER BY c.nombreCategoria")
    List<DesempenoIADTO> desempenoIA();
}
