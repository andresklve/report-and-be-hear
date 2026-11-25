package pe.edu.upc.reportandbeheard.servicesimplements;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IEmailService;

import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class EmailServiceImplement implements IEmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailServiceImplement.class);
    private static final Pattern URL = Pattern.compile("https?://\\S+");

    private final ObjectProvider<JavaMailSender> mailSender;
    private final String remitente;
    private final String nombreRemitente;

    public EmailServiceImplement(ObjectProvider<JavaMailSender> mailSender,
                                 @Value("${app.mail.from:no-reply@reclamaya.pe}") String remitente,
                                 @Value("${app.mail.from-name:ReclamaYA}") String nombreRemitente) {
        this.mailSender = mailSender;
        this.remitente = remitente;
        this.nombreRemitente = nombreRemitente;
    }

    @Override
    public boolean correoReal() {
        return mailSender.getIfAvailable() != null;
    }

    @Override
    @Async // Gmail tarda 1-2 s: se envia en segundo plano para no demorar la respuesta
    public void enviar(String para, String asunto, String cuerpo) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (sender == null) {
            // Modo desarrollo: sin SMTP configurado se muestra el correo en la consola.
            log.info("""

                    ===================== CORREO (modo desarrollo, no se envió) =====================
                    Para:   {}
                    Asunto: {}
                    ---------------------------------------------------------------------------------
                    {}
                    =================================================================================""",
                    para, asunto, cuerpo);
            return;
        }
        try {
            MimeMessage msg = sender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, StandardCharsets.UTF_8.name());
            h.setFrom(remitente, nombreRemitente);
            h.setTo(para);
            h.setSubject(asunto);
            h.setText(cuerpo, html(asunto, cuerpo)); // texto plano + HTML: el cliente de correo elige
            sender.send(msg);
            log.info("Correo enviado a {}: {}", para, asunto);
        } catch (Exception e) {
            // Un fallo de correo nunca debe romper la operación principal (p. ej. cambiar el estado).
            log.warn("No se pudo enviar el correo a {}: {}", para, e.getMessage());
        }
    }

    /** Versión HTML sencilla con los colores de ReclamaYA; los enlaces se muestran como botón. */
    static String html(String asunto, String cuerpo) {
        StringBuilder parrafos = new StringBuilder();
        for (String bloque : cuerpo.split("\\n\\s*\\n")) {
            String b = bloque.strip();
            if (b.isEmpty()) {
                continue;
            }
            Matcher m = URL.matcher(b);
            if (m.matches()) {
                String url = escapar(b);
                parrafos.append("<p style=\"margin:24px 0;text-align:center\"><a href=\"").append(url)
                        .append("\" style=\"display:inline-block;background:#C8102E;color:#ffffff;text-decoration:none;"
                                + "font-weight:700;padding:12px 22px;border-radius:6px\">Abrir enlace</a></p>")
                        .append("<p style=\"margin:0 0 16px;font-size:12px;color:#6B727C;word-break:break-all\">"
                                + "Si el botón no funciona, copia este enlace en tu navegador:<br>")
                        .append(url).append("</p>");
            } else if (b.startsWith("Token:")) {
                // El token ya va dentro del enlace; no hace falta mostrarlo en la versión HTML
                continue;
            } else {
                parrafos.append("<p style=\"margin:0 0 16px\">").append(escapar(b).replace("\n", "<br>")).append("</p>");
            }
        }
        return """
                <!doctype html>
                <html><body style="margin:0;background:#F3F4F6;font-family:Segoe UI,Arial,sans-serif;color:#16191D">
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="padding:24px 12px">
                <tr><td align="center">
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #E1E4E8;border-radius:8px">
                <tr><td style="padding:18px 24px;border-bottom:1px solid #E1E4E8;font-size:18px;font-weight:800">Reclama<span style="color:#C8102E">YA</span></td></tr>
                <tr><td style="padding:24px;font-size:15px;line-height:1.5">
                <h1 style="margin:0 0 16px;font-size:18px">%s</h1>
                %s
                </td></tr>
                <tr><td style="padding:14px 24px;border-top:1px solid #E1E4E8;font-size:12px;color:#6B727C">Este es un correo automático de ReclamaYA. No respondas a este mensaje.</td></tr>
                </table>
                </td></tr></table>
                </body></html>
                """.formatted(escapar(asunto.replace("[ReclamaYA] ", "")), parrafos);
    }

    private static String escapar(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
