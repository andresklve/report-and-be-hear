package pe.edu.upc.reportandbeheard.servicesimplements;

import org.springframework.stereotype.Service;
import pe.edu.upc.reportandbeheard.entities.Zona;
import pe.edu.upc.reportandbeheard.repositories.IZonaRepository;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IZonaService;

import java.util.List;
import java.util.Optional;

@Service
public class ZonaServiceImplement implements IZonaService {
    private final IZonaRepository zR;

    public ZonaServiceImplement(IZonaRepository zR) {
        this.zR = zR;
    }

    @Override
    public void insert(Zona zona) {
        zR.save(zona);
    }

    @Override
    public List<Zona> list() {
        return zR.findAll();
    }

    @Override
    public void update(Zona zona) {
        zR.save(zona);
    }

    @Override
    public void delete(Long idZona) {
        zR.deleteById(idZona);
    }

    @Override
    public Optional<Zona> listId(Long id) {
        return zR.findById(id);
    }
}
