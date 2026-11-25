package pe.edu.upc.reportandbeheard.servicesimplements;

import org.springframework.stereotype.Service;
import pe.edu.upc.reportandbeheard.dtos.InversionDepartamentoDTO;
import pe.edu.upc.reportandbeheard.dtos.CostoCategoriaDTO;
import pe.edu.upc.reportandbeheard.dtos.TiempoAtencionDTO;
import pe.edu.upc.reportandbeheard.entities.Moderacion;
import pe.edu.upc.reportandbeheard.repositories.IModeracionRepository;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IModeracionService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ModeracionServiceImplement implements IModeracionService {
    private final IModeracionRepository moderacionRepository;

    public ModeracionServiceImplement(IModeracionRepository moderacionRepository) {
        this.moderacionRepository = moderacionRepository;
    }

    @Override
    public List<InversionDepartamentoDTO> obtenerInversionPorDepartamento() {
        return moderacionRepository.obtenerInversionPorDepartamento()
                .stream()
                .map(reporte -> new InversionDepartamentoDTO(
                        reporte.getDepartamento(),
                        reporte.getTotalInversion() == null
                                ? BigDecimal.ZERO
                                : reporte.getTotalInversion()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<CostoCategoriaDTO> obtenerCostoPorCategoria() {
        return moderacionRepository.obtenerCostoPorCategoria()
                .stream()
                .map(reporte -> new CostoCategoriaDTO(
                        reporte.getCategoria(),
                        reporte.getTotalCosto() == null
                                ? BigDecimal.ZERO
                                : reporte.getTotalCosto()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public TiempoAtencionDTO obtenerTiempoPromedioAtencion() {
        Double dias = moderacionRepository.obtenerTiempoPromedioAtencion();
        return new TiempoAtencionDTO(dias == null ? 0.0 : dias);
    }

    @Override
    public void insert(Moderacion moderacion) {
        moderacionRepository.save(moderacion);
    }

    @Override
    public List<Moderacion> list() {
        return moderacionRepository.findAll();
    }

    @Override
    public void update(Moderacion moderacion) {
        moderacionRepository.save(moderacion);
    }

    @Override
    public void delete(Long idModeracion) {
        moderacionRepository.deleteById(idModeracion);
    }

    @Override
    public Optional<Moderacion> listId(Long id) {
        return moderacionRepository.findById(id);
    }
}
