package pe.edu.upc.reportandbeheard.servicesimplements;

import org.springframework.stereotype.Service;
import pe.edu.upc.reportandbeheard.entities.Comentario;
import pe.edu.upc.reportandbeheard.repositories.IComentarioRepository;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IComentarioService;

import java.util.List;
import java.util.Optional;

@Service
public class ComentarioServiceImplement implements IComentarioService {
    private final IComentarioRepository cR;

    public ComentarioServiceImplement(IComentarioRepository cR) {
        this.cR = cR;
    }

    @Override
    public void insert(Comentario comentario) {
        cR.save(comentario);
    }

    @Override
    public List<Comentario> list() {
        return cR.findAll();
    }

    @Override
    public void delete(Long idComentario) {
        cR.deleteById(idComentario);
    }

    @Override
    public Optional<Comentario> listId(Long id) {
        return cR.findById(id);
    }

    @Override
    public List<Comentario> listPorTestimonio(Long idTestimonio) {
        return cR.findByTestimonio_IdTestimonioOrderByFechaCreacionAsc(idTestimonio);
    }
}
