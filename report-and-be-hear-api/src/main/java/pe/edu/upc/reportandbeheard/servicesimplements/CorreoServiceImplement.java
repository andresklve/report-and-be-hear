package pe.edu.upc.reportandbeheard.servicesimplements;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import pe.edu.upc.reportandbeheard.exceptions.OperacionNoPermitidaException;
import pe.edu.upc.reportandbeheard.servicesinterfaces.ICorreoService;

/**
 * Envia correos con Gmail (SMTP smtp.gmail.com:587).
 * La cuenta y la contrasena de aplicacion van en local.properties o en las variables
 * MAIL_USERNAME y MAIL_PASSWORD. Sin cuenta configurada, el link se muestra en la consola.
 */
@Service
public class CorreoServiceImplement implements ICorreoService {

    private static final Logger log = LoggerFactory.getLogger(CorreoServiceImplement.class);

    private final JavaMailSender mailSender;
    private final String remitente;

    public CorreoServiceImplement(JavaMailSender mailSender,
                                  @Value("${spring.mail.username:}") String remitente) {
        this.mailSender = mailSender;
        this.remitente = remitente == null ? "" : remitente.trim();
        log.info("Correo de verificacion: {}", this.remitente.isEmpty()
                ? "sin MAIL_USERNAME, el link se mostrara en la consola"
                : "Gmail " + this.remitente);
    }

    @Override
    public void enviarVerificacion(String correo, String nombres, String link) {
        if (remitente.isEmpty()) {
            log.warn("Correo no configurado. Link de verificacion para {}: {}", correo, link);
            return;
        }
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setFrom(remitente, "ReclamaYA");
            helper.setTo(correo);
            helper.setSubject("Confirma tu cuenta de ReclamaYA");
            helper.setText(textoPlano(nombres, link), html(nombres, link));
            mailSender.send(mensaje);
            log.info("Correo de verificacion enviado a {}", correo);
        } catch (Exception e) {
            log.error("No se pudo enviar el correo a {}: {}", correo, e.getMessage());
            throw new OperacionNoPermitidaException("No pudimos enviar el correo de verificación. Revisa que el correo sea correcto e inténtalo otra vez.");
        }
    }

    @Override
    public void enviarRecuperacion(String correo, String nombres, String link) {
        if (remitente.isEmpty()) {
            log.warn("Correo no configurado. Link para cambiar la contrasena de {}: {}", correo, link);
            return;
        }
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setFrom(remitente, "ReclamaYA");
            helper.setTo(correo);
            helper.setSubject("Cambia tu contraseña de ReclamaYA");
            helper.setText("Hola " + nombres + ",\n\n"
                    + "Recibimos un pedido para cambiar la contraseña de tu cuenta. Abre este link:\n"
                    + link + "\n\n"
                    + "El link vence en 1 hora. Si no lo pediste, ignora este correo: tu contraseña no cambia.",
                    plantilla(nombres, "Recibimos un pedido para cambiar la contraseña de tu cuenta.",
                            "Cambiar mi contraseña", link,
                            "El link vence en 1 hora. Si no lo pediste, ignora este correo: tu contraseña no cambia."));
            mailSender.send(mensaje);
            log.info("Correo para cambiar la contrasena enviado a {}", correo);
        } catch (Exception e) {
            log.error("No se pudo enviar el correo a {}: {}", correo, e.getMessage());
            throw new OperacionNoPermitidaException("No pudimos enviar el correo. Inténtalo otra vez en unos minutos.");
        }
    }

    private String textoPlano(String nombres, String link) {
        return "Hola " + nombres + ",\n\n"
                + "Gracias por registrarte en ReclamaYA. Para activar tu cuenta abre este link:\n"
                + link + "\n\n"
                + "El link vence en 24 horas. Si no creaste esta cuenta, ignora este correo.";
    }

    private String html(String nombres, String link) {
        return plantilla(nombres, "Gracias por registrarte. Para activar tu cuenta y empezar a reportar, confirma tu correo:",
                "Confirmar mi cuenta", link,
                "El link vence en 24 horas. Si no creaste esta cuenta, ignora este correo.");
    }

    // Plantilla HTML comun de los correos
    private String plantilla(String nombres, String texto, String boton, String link, String nota) {
        return """
                <div style="font-family:Roboto,Arial,sans-serif;max-width:480px;margin:auto;color:#1f2937">
                  <h2 style="color:#0f4c81;margin-bottom:4px">ReclamaYA</h2>
                  <p>Hola <b>%s</b>,</p>
                  <p>%s</p>
                  <p style="text-align:center;margin:28px 0">
                    <a href="%s" style="background:#0f4c81;color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:600">%s</a>
                  </p>
                  <p style="font-size:13px;color:#6b7280">Si el botón no funciona, copia este link en tu navegador:<br><a href="%s">%s</a></p>
                  <p style="font-size:13px;color:#6b7280">%s</p>
                </div>
                """.formatted(nombres, texto, link, boton, link, link, nota);
    }
}
