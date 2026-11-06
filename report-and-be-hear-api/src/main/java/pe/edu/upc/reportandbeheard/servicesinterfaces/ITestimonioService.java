package pe.edu.upc.reportandbeheard.servicesinterfaces;

import pe.edu.upc.reportandbeheard.entities.Testimonio;

import java.util.List;
import java.util.Optional;

public interface ITestimonioService {
    void insert(Testimonio testimonio);
    List<Testimonio> list();
    void update(Testimonio testimonio);
    void delete(Long idTestimonio);
    Optional<Testimonio> listId(Long id);
}
