package pe.edu.upc.reportandbeheard.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.upc.reportandbeheard.entities.Suspension;

import java.util.List;

@Repository
public interface ISuspensionRepository extends JpaRepository<Suspension, Long> {
    List<Suspension> findByUsuario_IdUsuarioAndActivaTrue(Long idUsuario);

    List<Suspension> findAllByOrderByFechaInicioDesc();
}
