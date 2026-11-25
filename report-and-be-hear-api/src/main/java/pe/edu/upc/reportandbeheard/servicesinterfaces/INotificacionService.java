package pe.edu.upc.reportandbeheard.servicesinterfaces;

import pe.edu.upc.reportandbeheard.entities.Notificacion;
import pe.edu.upc.reportandbeheard.entities.Testimonio;
import pe.edu.upc.reportandbeheard.entities.Usuario;

import java.util.List;
import java.util.Optional;

public interface INotificacionService {
    void insert(Notificacion notificacion);
    void update(Notificacion notificacion);
    Optional<Notificacion> listId(Long id);
    List<Notificacion> listPorUsuario(Long idUsuario);

    // Crea un aviso para el usuario (testimonio puede ser nulo)
    // Ademas del aviso en la app, se envia al correo del usuario (si tiene uno registrado)
    void notificar(Usuario usuario, Testimonio testimonio, String tipo, String mensaje);

    // Igual, pero eligiendo si tambien se envia el correo
    void notificar(Usuario usuario, Testimonio testimonio, String tipo, String mensaje, boolean enviarCorreo);
}
