package pe.edu.upc.reportandbeheard.servicesinterfaces;

import pe.edu.upc.reportandbeheard.entities.Zona;

import java.util.List;
import java.util.Optional;

public interface IZonaService {
    void insert(Zona zona);
    List<Zona> list();
    void update(Zona zona);
    void delete(Long idZona);
    Optional<Zona> listId(Long id);
}
