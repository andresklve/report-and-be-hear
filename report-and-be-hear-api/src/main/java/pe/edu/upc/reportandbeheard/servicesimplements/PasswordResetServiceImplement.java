package pe.edu.upc.reportandbeheard.servicesimplements;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upc.reportandbeheard.entities.PasswordResetToken;
import pe.edu.upc.reportandbeheard.entities.Usuario;
import pe.edu.upc.reportandbeheard.exceptions.OperacionNoPermitidaException;
import pe.edu.upc.reportandbeheard.repositories.IPasswordResetTokenRepository;
import pe.edu.upc.reportandbeheard.repositories.IUsuarioRepository;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IEmailService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IPasswordResetService;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class PasswordResetServiceImplement implements IPasswordResetService {
    private static final Logger log = LoggerFactory.getLogger(PasswordResetServiceImplement.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final IUsuarioRepository uR;
    private final IPasswordResetTokenRepository prR;
    private final PasswordEncoder passwordEncoder;
    private final IEmailService emailService;
    private final String frontendUrl;
    private final long minutos;

    public PasswordResetServiceImplement(IUsuarioRepository uR, IPasswordResetTokenRepository prR,
                                         PasswordEncoder passwordEncoder, IEmailService emailService,
                                         @Value("${app.frontend-url:http://localhost:4200}") String frontendUrl,
                                         @Value("${app.password-reset.minutes:30}") long minutos) {
        this.uR = uR;
        this.prR = prR;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
        this.minutos = minutos;
    }

    @Override
    @Transactional
    public String solicitar(String correo) {
        Usuario u = uR.findByCorreoIgnoreCase(correo.trim())
                .filter(x -> Boolean.TRUE.equals(x.getActivo()))
                .orElse(null);
        if (u == null) {
            // No se avisa al cliente para no revelar qué correos están registrados
            log.info("Solicitud de restablecimiento para un correo no registrado: {}", correo);
            return null;
        }
        prR.invalidarTodos(u.getIdUsuario()); // solo sirve el último enlace pedido
        String token = generarToken();
        prR.save(new PasswordResetToken(sha256(token), u, LocalDateTime.now().plusMinutes(minutos)));
        String enlace = frontendUrl + "/restablecer?token=" + token;
        emailService.enviar(u.getCorreo(), "[ReclamaYA] Restablece tu contraseña",
                "Hola " + u.getNombres() + ",\n\nRecibimos una solicitud para restablecer tu contraseña.\n"
                        + "Abre este enlace (válido por " + minutos + " minutos):\n\n" + enlace
                        + "\n\nSi no fuiste tú, ignora este mensaje.\n\nEquipo ReclamaYA");
        return enlace;
    }

    @Override
    @Transactional
    public void restablecer(String token, String nuevaPassword) {
        PasswordResetToken pr = prR.findByTokenHash(sha256(token))
                .filter(PasswordResetToken::esValido)
                .orElseThrow(() -> new OperacionNoPermitidaException(
                        "El enlace no es válido o ya expiró. Solicita uno nuevo."));
        Usuario u = pr.getUsuario();
        u.setPasswordHash(passwordEncoder.encode(nuevaPassword));
        uR.save(u);
        pr.setUsado(true);
        prR.save(pr);
        prR.invalidarTodos(u.getIdUsuario());
    }

    // Token aleatorio para el enlace; en la base solo se guarda su hash
    private static String generarToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String sha256(String valor) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(valor.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
