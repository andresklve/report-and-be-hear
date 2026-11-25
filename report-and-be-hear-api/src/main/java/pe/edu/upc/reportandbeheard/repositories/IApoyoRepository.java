package pe.edu.upc.reportandbeheard.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pe.edu.upc.reportandbeheard.dtos.RankingApoyoDTO;
import pe.edu.upc.reportandbeheard.entities.Apoyo;

import java.util.List;
import java.util.Optional;

@Repository
public interface IApoyoRepository extends JpaRepository<Apoyo, Long> {
    long countByTestimonio_IdTestimonio(Long idTestimonio);

    Optional<Apoyo> findByTestimonio_IdTestimonioAndUsuario_IdUsuario(Long idTestimonio, Long idUsuario);

    // Testimonios con al menos un apoyo, del mas apoyado al menos apoyado
    @Query("SELECT new pe.edu.upc.reportandbeheard.dtos.RankingApoyoDTO(" +
            "t.idTestimonio, COUNT(a)) " +
            "FROM Apoyo a JOIN a.testimonio t " +
            "GROUP BY t.idTestimonio " +
            "ORDER BY COUNT(a) DESC, t.idTestimonio DESC")
    List<RankingApoyoDTO> rankingApoyos();
}
