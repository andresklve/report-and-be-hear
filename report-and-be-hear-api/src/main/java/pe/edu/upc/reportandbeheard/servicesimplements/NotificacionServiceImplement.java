package pe.edu.upc.reportandbeheard.servicesimplements;

import org.springframework.stereotype.Service;
import pe.edu.upc.reportandbeheard.entities.Notificacion;
import pe.edu.upc.reportandbeheard.entities.Testimonio;
import pe.edu.upc.reportandbeheard.entities.Usuario;
import pe.edu.upc.reportandbeheard.repositories.INotificacionRepository;
import pe.edu.upc.reportandbeheard.servicesinterfaces.INotificacionService;

import java.util.List;
import java.util.Optional;

@Service
public class NotificacionServiceImplement implements INotificacionService {
    private final INotificacionRepository nR;

    public NotificacionServiceImplement(INotificacionRepository nR) {
        this.nR = nR;
    }

    @Override
    public void insert(Notificacion notificacion) {
        nR.save(notificacion);
    }

    @Override
    public void update(Notificacion notificacion) {
        nR.save(notificacion);
    }

    @Override
    public Optional<Notificacion> listId(Long id) {
        return nR.findById(id);
    }

    @Override
    public List<Notificacion> listPorUsuario(Long idUsuario) {
        return nR.findByUsuario_IdUsuarioOrderByFechaCreacionDesc(idUsuario);
    }

    @Override
    public void notificar(Usuario usuario, Testimonio testimonio, String tipo, String mensaje) {
        Notificacion n = new Notificacion();
        n.setUsuario(usuario);
        n.setTestimonio(testimonio);
        n.setTipo(tipo);
        n.setMensaje(mensaje.length() > 300 ? mensaje.substring(0, 297) + "..." : mensaje);
        nR.save(n);
    }
}
