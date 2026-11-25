package pe.edu.upc.reportandbeheard.servicesimplements;

import org.springframework.stereotype.Service;
import pe.edu.upc.reportandbeheard.entities.Usuario;
import pe.edu.upc.reportandbeheard.repositories.IPasswordResetTokenRepository;
import pe.edu.upc.reportandbeheard.repositories.IUsuarioRepository;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IUsuarioService;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioServiceImplement implements IUsuarioService {
    private final IUsuarioRepository uR;
    private final IPasswordResetTokenRepository prR;

    public UsuarioServiceImplement(IUsuarioRepository uR, IPasswordResetTokenRepository prR) {
        this.uR = uR;
        this.prR = prR;
    }

    @Override
    public void insert(Usuario usuario) {
        uR.save(usuario);
    }

    @Override
    public List<Usuario> list() {
        return uR.findAll();
    }

    @Override
    public void update(Usuario usuario) {
        uR.save(usuario);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void delete(Long idUsuario) {
        prR.eliminarPorUsuario(idUsuario); // enlaces de "olvide mi contrasena" del usuario
        uR.deleteById(idUsuario);
    }

    @Override
    public Optional<Usuario> listId(Long id) {
        return uR.findById(id);
    }
}