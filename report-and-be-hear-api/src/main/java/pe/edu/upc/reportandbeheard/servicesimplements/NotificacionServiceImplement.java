package pe.edu.upc.reportandbeheard.servicesimplements;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import pe.edu.upc.reportandbeheard.entities.Notificacion;
import pe.edu.upc.reportandbeheard.entities.Testimonio;
import pe.edu.upc.reportandbeheard.entities.Usuario;
import pe.edu.upc.reportandbeheard.repositories.INotificacionRepository;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IEmailService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.INotificacionService;

import java.util.List;
import java.util.Optional;

@Service
public class NotificacionServiceImplement implements INotificacionService {
    private final INotificacionRepository nR;
    private final IEmailService emailService;
    private final String frontendUrl;

    public NotificacionServiceImplement(INotificacionRepository nR, IEmailService emailService,
                                        @Value("${app.frontend-url:http://localhost:4200}") String frontendUrl) {
        this.nR = nR;
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
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
        notificar(usuario, testimonio, tipo, mensaje, true);
    }

    @Override
    public void notificar(Usuario usuario, Testimonio testimonio, String tipo, String mensaje, boolean enviarCorreo) {
        Notificacion n = new Notificacion();
        n.setUsuario(usuario);
        n.setTestimonio(testimonio);
        n.setTipo(tipo);
        n.setMensaje(mensaje.length() > 300 ? mensaje.substring(0, 297) + "..." : mensaje);
        nR.save(n);

        if (enviarCorreo && usuario.getCorreo() != null && !usuario.getCorreo().isBlank()) {
            enviarCorreo(usuario, testimonio, tipo, mensaje);
        }
    }

    private void enviarCorreo(Usuario usuario, Testimonio testimonio, String tipo, String mensaje) {
        String asunto = switch (tipo) {
            case "ESTADO" -> "Tu reporte tiene una actualización";
            case "COMENTARIO" -> "Respondieron a tu reporte";
            case "SUSPENSION" -> "Aviso sobre tu cuenta";
            default -> "Tienes una nueva notificación";
        };
        StringBuilder cuerpo = new StringBuilder()
                .append("Hola ").append(usuario.getNombres()).append(",\n\n")
                .append(mensaje).append("\n\n");
        if (testimonio != null) {
            cuerpo.append("Revisa el detalle de tu reporte aquí:\n\n")
                    .append(frontendUrl).append("/reporte/").append(testimonio.getIdTestimonio()).append("\n\n");
        }
        cuerpo.append("Equipo ReclamaYA");
        emailService.enviar(usuario.getCorreo(), "[ReclamaYA] " + asunto, cuerpo.toString());
    }
}
