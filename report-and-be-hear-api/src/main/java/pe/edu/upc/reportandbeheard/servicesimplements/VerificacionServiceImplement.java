package pe.edu.upc.reportandbeheard.servicesimplements;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import pe.edu.upc.reportandbeheard.entities.Usuario;
import pe.edu.upc.reportandbeheard.entities.Verificacion;
import pe.edu.upc.reportandbeheard.repositories.IVerificacionRepository;
import pe.edu.upc.reportandbeheard.servicesinterfaces.ICorreoService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IVerificacionService;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class VerificacionServiceImplement implements IVerificacionService {
    private final IVerificacionRepository vR;
    private final ICorreoService correoS;
    // Direccion del frontend donde se abre el link (en produccion, la de Netlify)
    private final String frontUrl;

    public VerificacionServiceImplement(IVerificacionRepository vR, ICorreoService correoS,
                                        @Value("${app.front.url:http://localhost:4200}") String frontUrl) {
        this.vR = vR;
        this.correoS = correoS;
        this.frontUrl = frontUrl.endsWith("/") ? frontUrl.substring(0, frontUrl.length() - 1) : frontUrl;
    }

    @Override
    public Verificacion generar(Usuario usuario) {
        Verificacion v = new Verificacion();
        v.setUsuario(usuario);
        v.setToken(UUID.randomUUID().toString().replace("-", ""));
        v.setTipo("REGISTRO");
        v.setFechaCreacion(LocalDateTime.now());
        v.setFechaExpira(LocalDateTime.now().plusHours(24));
        v.setUsado(false);
        vR.save(v);

        String link = frontUrl + "/verificar?token=" + v.getToken();
        correoS.enviarVerificacion(usuario.getCorreo(), usuario.getNombres(), link);
        return v;
    }

    @Override
    public Verificacion generarRecuperacion(Usuario usuario) {
        Verificacion v = new Verificacion();
        v.setUsuario(usuario);
        v.setToken(UUID.randomUUID().toString().replace("-", ""));
        v.setTipo("RECUPERACION");
        v.setFechaCreacion(LocalDateTime.now());
        v.setFechaExpira(LocalDateTime.now().plusHours(1));
        v.setUsado(false);
        vR.save(v);

        String link = frontUrl + "/restablecer?token=" + v.getToken();
        correoS.enviarRecuperacion(usuario.getCorreo(), usuario.getNombres(), link);
        return v;
    }

    @Override
    public Optional<Verificacion> buscarPorToken(String token) {
        return vR.findByToken(token);
    }

    @Override
    public void update(Verificacion verificacion) {
        vR.save(verificacion);
    }

    @Override
    public void eliminarPorUsuario(Long idUsuario) {
        vR.deleteAll(vR.findByUsuario_IdUsuario(idUsuario));
    }
}
