package pe.edu.upc.reportandbeheard.servicesinterfaces;

import pe.edu.upc.reportandbeheard.entities.Usuario;
import pe.edu.upc.reportandbeheard.entities.Verificacion;

import java.util.Optional;

public interface IVerificacionService {
    // Crea un token nuevo para el usuario y le envia el link a su correo
    Verificacion generar(Usuario usuario);

    // Crea un token para cambiar la contrasena y le envia el link a su correo
    Verificacion generarRecuperacion(Usuario usuario);

    Optional<Verificacion> buscarPorToken(String token);

    void update(Verificacion verificacion);

    // Borra los tokens del usuario (antes de eliminarlo)
    void eliminarPorUsuario(Long idUsuario);
}
