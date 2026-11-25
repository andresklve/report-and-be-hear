package pe.edu.upc.reportandbeheard.servicesimplements;

import org.springframework.stereotype.Service;
import pe.edu.upc.reportandbeheard.entities.Testimonio;
import pe.edu.upc.reportandbeheard.repositories.ITestimonioRepository;
import pe.edu.upc.reportandbeheard.servicesinterfaces.ITestimonioService;

import java.util.List;
import java.util.Optional;

@Service
public class TestimonioServiceImplement implements ITestimonioService {
    private final ITestimonioRepository tR;

    public TestimonioServiceImplement(ITestimonioRepository tR) {
        this.tR = tR;
    }

    @Override
    public void insert(Testimonio testimonio) {
        tR.save(testimonio);
    }

    @Override
    public List<Testimonio> list() {
        return tR.findAll();
    }

    @Override
    public void update(Testimonio testimonio) {
        tR.save(testimonio);
    }

    @Override
    public void delete(Long idTestimonio) {
        tR.deleteById(idTestimonio);
    }

    @Override
    public Optional<Testimonio> listId(Long id) {
        return tR.findById(id);
    }
}
