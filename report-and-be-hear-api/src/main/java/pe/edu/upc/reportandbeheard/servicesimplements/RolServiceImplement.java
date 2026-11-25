package pe.edu.upc.reportandbeheard.servicesimplements;

import org.springframework.stereotype.Service;
import pe.edu.upc.reportandbeheard.entities.Rol;
import pe.edu.upc.reportandbeheard.repositories.IRolRepository;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IRolService;

import java.util.List;
import java.util.Optional;

@Service
public class RolServiceImplement implements IRolService {
    private final IRolRepository rR;

    public RolServiceImplement(IRolRepository rR) {
        this.rR = rR;
    }

    @Override
    public void insert(Rol rol) {
        rR.save(rol);
    }

    @Override
    public List<Rol> list() {
        return rR.findAll();
    }

    @Override
    public void update(Rol rol) {
        rR.save(rol);
    }

    @Override
    public void delete(Long idRol) {
        rR.deleteById(idRol);
    }

    @Override
    public Optional<Rol> listId(Long id) {
        return rR.findById(id);
    }
}
