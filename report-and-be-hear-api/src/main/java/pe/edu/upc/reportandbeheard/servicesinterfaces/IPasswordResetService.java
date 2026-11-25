package pe.edu.upc.reportandbeheard.servicesinterfaces;

public interface IPasswordResetService {
    /**
     * Si el correo pertenece a una cuenta activa, genera un enlace de un solo uso y lo envía por correo.
     * Devuelve el enlace (para el modo demostración) o null si el correo no está registrado.
     */
    String solicitar(String correo);

    /** Cambia la contraseña con el token del enlace. Lanza excepción si el token no es válido o expiró. */
    void restablecer(String token, String nuevaPassword);
}
