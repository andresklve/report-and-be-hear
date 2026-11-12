package pe.edu.upc.reportandbeheard.servicesinterfaces;

import pe.edu.upc.reportandbeheard.entities.Usuario;

import java.util.List;
import java.util.Optional;

public interface IUsuarioService {
    void insert(Usuario usuario);
    List<Usuario> list();
    void update(Usuario usuario);
    void delete(Long idUsuario);
    Optional<Usuario> listId(Long id);
}