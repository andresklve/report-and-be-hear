package pe.edu.upc.reportandbeheard.servicesinterfaces;

public interface IEmailService {
    /**
     * Envía un correo (texto plano + versión HTML) en segundo plano.
     * Si no hay servidor SMTP configurado (spring.mail.host), el correo se escribe en la consola
     * para poder probar en local sin enviar nada. Un fallo nunca rompe la operación que lo dispara.
     */
    void enviar(String para, String asunto, String cuerpo);

    /** true si hay un servidor SMTP configurado y los correos salen de verdad. */
    boolean correoReal();
}
