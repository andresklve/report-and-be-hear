package pe.edu.upc.reportandbeheard.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.upc.reportandbeheard.entities.Verificacion;

import java.util.List;
import java.util.Optional;

@Repository
public interface IVerificacionRepository extends JpaRepository<Verificacion, Long> {
    Optional<Verificacion> findByToken(String token);

    List<Verificacion> findByUsuario_IdUsuario(Long idUsuario);
}
