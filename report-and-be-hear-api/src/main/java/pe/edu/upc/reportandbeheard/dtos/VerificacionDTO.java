package pe.edu.upc.reportandbeheard.dtos;

// Respuesta al confirmar o reenviar el link de verificacion
public class VerificacionDTO {
    private String mensaje;
    private String username;
    private String correo;

    public VerificacionDTO() {}

    public VerificacionDTO(String mensaje, String username, String correo) {
        this.mensaje = mensaje;
        this.username = username;
        this.correo = correo;
    }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
}
