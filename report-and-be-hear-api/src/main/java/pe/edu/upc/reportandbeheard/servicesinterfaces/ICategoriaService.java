package pe.edu.upc.reportandbeheard.servicesinterfaces;

import pe.edu.upc.reportandbeheard.entities.Categoria;

import java.util.List;
import java.util.Optional;

public interface ICategoriaService {
    void insert(Categoria categoria);
    List<Categoria> list();
    void update(Categoria categoria);
    void delete(Long idCategoria);
    Optional<Categoria> listId(Long id);
}