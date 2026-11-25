package pe.edu.upc.reportandbeheard.servicesinterfaces;

import pe.edu.upc.reportandbeheard.dtos.InversionDepartamentoDTO;
import pe.edu.upc.reportandbeheard.dtos.CostoCategoriaDTO;
import pe.edu.upc.reportandbeheard.dtos.TiempoAtencionDTO;
import pe.edu.upc.reportandbeheard.entities.Moderacion;

import java.util.List;
import java.util.Optional;

public interface IModeracionService {
    // Reportes
    List<InversionDepartamentoDTO> obtenerInversionPorDepartamento();
    List<CostoCategoriaDTO> obtenerCostoPorCategoria();
    TiempoAtencionDTO obtenerTiempoPromedioAtencion();

    // CRUD (US06)
    void insert(Moderacion moderacion);
    List<Moderacion> list();
    void update(Moderacion moderacion);
    void delete(Long idModeracion);
    Optional<Moderacion> listId(Long id);
}
