package pe.edu.upc.reportandbeheard.servicesinterfaces;

public interface ICorreoService {
    // Envia al ciudadano el link para verificar su cuenta
    void enviarVerificacion(String correo, String nombres, String link);

    // Envia el link para poner una contrasena nueva
    void enviarRecuperacion(String correo, String nombres, String link);
}
