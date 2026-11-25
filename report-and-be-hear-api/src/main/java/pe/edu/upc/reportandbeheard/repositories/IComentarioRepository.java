package pe.edu.upc.reportandbeheard.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.edu.upc.reportandbeheard.entities.Comentario;

import java.util.List;

@Repository
public interface IComentarioRepository extends JpaRepository<Comentario, Long> {
    List<Comentario> findByTestimonio_IdTestimonioOrderByFechaCreacionAsc(Long idTestimonio);
}
