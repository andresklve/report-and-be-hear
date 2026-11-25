package pe.edu.upc.reportandbeheard.servicesinterfaces;

import pe.edu.upc.reportandbeheard.entities.Rol;

import java.util.List;
import java.util.Optional;

public interface IRolService {
    void insert(Rol rol);
    List<Rol> list();
    void update(Rol rol);
    void delete(Long idRol);
    Optional<Rol> listId(Long id);
}
