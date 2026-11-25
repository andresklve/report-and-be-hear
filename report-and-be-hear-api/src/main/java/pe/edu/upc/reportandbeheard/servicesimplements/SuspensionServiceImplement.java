package pe.edu.upc.reportandbeheard.servicesimplements;

import org.springframework.stereotype.Service;
import pe.edu.upc.reportandbeheard.entities.Suspension;
import pe.edu.upc.reportandbeheard.exceptions.OperacionNoPermitidaException;
import pe.edu.upc.reportandbeheard.repositories.ISuspensionRepository;
import pe.edu.upc.reportandbeheard.servicesinterfaces.ISuspensionService;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class SuspensionServiceImplement implements ISuspensionService {
    private final ISuspensionRepository sR;

    public SuspensionServiceImplement(ISuspensionRepository sR) {
        this.sR = sR;
    }

    @Override
    public void insert(Suspension suspension) {
        sR.save(suspension);
    }

    @Override
    public List<Suspension> list() {
        return sR.findAllByOrderByFechaInicioDesc();
    }

    @Override
    public void update(Suspension suspension) {
        sR.save(suspension);
    }

    @Override
    public Optional<Suspension> listId(Long id) {
        return sR.findById(id);
    }

    @Override
    public Optional<Suspension> vigente(Long idUsuario) {
        // Si hay varias vigentes, se toma la que termina mas tarde (nula = indefinida)
        return sR.findByUsuario_IdUsuarioAndActivaTrue(idUsuario)
                .stream()
                .filter(Suspension::estaVigente)
                .max(Comparator.comparing(s -> s.getFechaFin() == null
                        ? LocalDateTime.MAX
                        : s.getFechaFin()));
    }

    @Override
    public void validarNoSuspendido(Long idUsuario) {
        vigente(idUsuario).ifPresent(s -> {
            throw new OperacionNoPermitidaException(mensajeSuspension(s));
        });
    }

    @Override
    public String mensajeSuspension(Suspension suspension) {
        String hasta = suspension.getFechaFin() == null
                ? "de forma indefinida"
                : "hasta el " + suspension.getFechaFin().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        return "Tu cuenta está suspendida " + hasta + " (" + motivoLegible(suspension.getMotivo()) + ").";
    }

    private String motivoLegible(String motivo) {
        if ("COMENTARIO_OFENSIVO".equals(motivo)) return "comentarios ofensivos";
        if ("REPORTE_FALSO".equals(motivo)) return "reporte falso";
        return "incumplir las normas de la comunidad";
    }
}
