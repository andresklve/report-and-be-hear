package pe.edu.upc.reportandbeheard.servicesinterfaces;

import pe.edu.upc.reportandbeheard.entities.Comentario;

import java.util.List;
import java.util.Optional;

public interface IComentarioService {
    void insert(Comentario comentario);
    List<Comentario> list();
    void delete(Long idComentario);
    Optional<Comentario> listId(Long id);
    List<Comentario> listPorTestimonio(Long idTestimonio);
}
