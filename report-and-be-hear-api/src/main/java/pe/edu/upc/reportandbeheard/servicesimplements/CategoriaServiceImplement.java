package pe.edu.upc.reportandbeheard.servicesimplements;

import org.springframework.stereotype.Service;
import pe.edu.upc.reportandbeheard.entities.Categoria;
import pe.edu.upc.reportandbeheard.repositories.ICategoriaRepository;
import pe.edu.upc.reportandbeheard.servicesinterfaces.ICategoriaService;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaServiceImplement implements ICategoriaService {
    private final ICategoriaRepository cR;

    public CategoriaServiceImplement(ICategoriaRepository cR) {
        this.cR = cR;
    }

    @Override
    public void insert(Categoria categoria) {
        cR.save(categoria);
    }

    @Override
    public List<Categoria> list() {
        return cR.findAll();
    }

    @Override
    public void update(Categoria categoria) {
        cR.save(categoria);
    }

    @Override
    public void delete(Long idCategoria) {
        cR.deleteById(idCategoria);
    }

    @Override
    public Optional<Categoria> listId(Long id) {
        return cR.findById(id);
    }
}