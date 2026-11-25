package pe.edu.upc.reportandbeheard.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pe.edu.upc.reportandbeheard.dtos.InversionDepartamentoDTO;
import pe.edu.upc.reportandbeheard.dtos.CostoCategoriaDTO;
import pe.edu.upc.reportandbeheard.entities.Moderacion;

import java.util.List;

@Repository
public interface IModeracionRepository extends JpaRepository<Moderacion, Long> {
    @Query("""
            SELECT new pe.edu.upc.reportandbeheard.dtos.InversionDepartamentoDTO(
                z.departamentoZona,
                SUM(m.costo)
            )
            FROM Zona z
            LEFT JOIN Testimonio t ON t.zona = z
            LEFT JOIN Moderacion m ON m.testimonio = t
            GROUP BY z.departamentoZona
            ORDER BY z.departamentoZona
            """)
    List<InversionDepartamentoDTO> obtenerInversionPorDepartamento();

    @Query("""
            SELECT new pe.edu.upc.reportandbeheard.dtos.CostoCategoriaDTO(
                c.nombreCategoria,
                SUM(m.costo)
            )
            FROM Categoria c
            LEFT JOIN Testimonio t ON t.categoria = c
            LEFT JOIN Moderacion m ON m.testimonio = t
            GROUP BY c.nombreCategoria
            ORDER BY c.nombreCategoria
            """)
    List<CostoCategoriaDTO> obtenerCostoPorCategoria();

    // US13: promedio de dias entre fecha_creacion del testimonio y fecha_accion de la moderacion.
    // NULLIF evita la division entre cero (sin moderaciones devuelve NULL).
    @Query(value = "SELECT CAST(SUM(EXTRACT(EPOCH FROM (m.fecha_accion - t.fecha_creacion)) / 86400) " +
            "/ NULLIF(COUNT(*), 0) AS double precision) " +
            "FROM moderaciones m JOIN testimonios t ON m.id_testimonio = t.id_testimonio",
            nativeQuery = true)
    Double obtenerTiempoPromedioAtencion();
}
