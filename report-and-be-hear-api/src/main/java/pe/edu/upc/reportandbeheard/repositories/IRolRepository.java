package pe.edu.upc.reportandbeheard.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.upc.reportandbeheard.entities.Rol;

@Repository
public interface IRolRepository extends JpaRepository<Rol, Long> {
}
