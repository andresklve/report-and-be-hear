package pe.edu.upc.reportandbeheard.servicesinterfaces;

import pe.edu.upc.reportandbeheard.entities.Suspension;

import java.util.List;
import java.util.Optional;

public interface ISuspensionService {
    void insert(Suspension suspension);
    List<Suspension> list();
    void update(Suspension suspension);
    Optional<Suspension> listId(Long id);

    // Suspension vigente del usuario (activa y sin vencer), si tiene una
    Optional<Suspension> vigente(Long idUsuario);

    // Lanza OperacionNoPermitidaException si el usuario tiene una suspension vigente
    void validarNoSuspendido(Long idUsuario);

    // Texto para el usuario: "Tu cuenta está suspendida hasta el 20/11/2026 (Reporte falso)."
    String mensajeSuspension(Suspension suspension);
}
