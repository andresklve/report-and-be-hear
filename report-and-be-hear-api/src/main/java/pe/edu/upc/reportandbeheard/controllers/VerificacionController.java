package pe.edu.upc.reportandbeheard.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import pe.edu.upc.reportandbeheard.dtos.ReenvioVerificacionDTO;
import pe.edu.upc.reportandbeheard.dtos.RestablecerPasswordDTO;
import pe.edu.upc.reportandbeheard.dtos.VerificacionDTO;
import pe.edu.upc.reportandbeheard.entities.Usuario;
import pe.edu.upc.reportandbeheard.entities.Verificacion;
import pe.edu.upc.reportandbeheard.exceptions.OperacionNoPermitidaException;
import pe.edu.upc.reportandbeheard.exceptions.ResourceNotFoundException;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IUsuarioService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IVerificacionService;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/apis/verificaciones")
public class VerificacionController {
    private final IVerificacionService vS;
    private final IUsuarioService uS;
    private final PasswordEncoder passwordEncoder;

    public VerificacionController(IVerificacionService vS, IUsuarioService uS, PasswordEncoder passwordEncoder) {
        this.vS = vS;
        this.uS = uS;
        this.passwordEncoder = passwordEncoder;
    }

    @Operation(summary = "Confirmar el correo",
            description = "Recibe el token del link enviado al correo y activa la cuenta. El token vence en 24 horas y se usa una vez.")
    @GetMapping("/confirmar")
    public ResponseEntity<VerificacionDTO> confirmar(@RequestParam String token) {
        Verificacion v = vS.buscarPorToken(token)
                .filter(x -> !"RECUPERACION".equals(x.getTipo()))
                .orElseThrow(() ->
                        new ResourceNotFoundException("El link de verificación no es válido.")
                );
        Usuario usuario = v.getUsuario();

        if (Boolean.TRUE.equals(v.getUsado()) || Boolean.TRUE.equals(usuario.getActivo())) {
            return ResponseEntity.ok(new VerificacionDTO("Tu cuenta ya estaba verificada. Ya puedes ingresar.",
                    usuario.getUsername(), usuario.getCorreo()));
        }
        if (v.getFechaExpira().isBefore(LocalDateTime.now())) {
            throw new OperacionNoPermitidaException("El link venció. Pide uno nuevo con tu correo.");
        }

        v.setUsado(true);
        vS.update(v);
        usuario.setActivo(true);
        uS.update(usuario);

        return ResponseEntity.ok(new VerificacionDTO("¡Listo! Tu cuenta quedó verificada. Ya puedes ingresar.",
                usuario.getUsername(), usuario.getCorreo()));
    }

    @Operation(summary = "Reenviar el link de verificación",
            description = "Envía un link nuevo al correo de una cuenta que todavía no se ha verificado.")
    @PostMapping("/reenviar")
    public ResponseEntity<VerificacionDTO> reenviar(@Valid @RequestBody ReenvioVerificacionDTO dto) {
        String correo = dto.getCorreo().trim().toLowerCase();
        Usuario usuario = uS.list().stream()
                .filter(u -> correo.equalsIgnoreCase(u.getCorreo()))
                .findFirst()
                .orElseThrow(() ->
                        new ResourceNotFoundException("No hay una cuenta registrada con el correo " + correo + ".")
                );
        if (Boolean.TRUE.equals(usuario.getActivo())) {
            return ResponseEntity.ok(new VerificacionDTO("Esa cuenta ya está verificada. Ya puedes ingresar.",
                    usuario.getUsername(), usuario.getCorreo()));
        }

        vS.generar(usuario);
        return ResponseEntity.ok(new VerificacionDTO("Te enviamos un link nuevo a " + correo + ".",
                usuario.getUsername(), usuario.getCorreo()));
    }

    @Operation(summary = "Olvidé mi contraseña",
            description = "Envía al correo un link para poner una contraseña nueva (vence en 1 hora). "
                    + "Responde lo mismo exista o no el correo, para no revelar qué correos están registrados.")
    @PostMapping("/recuperar")
    public ResponseEntity<VerificacionDTO> recuperar(@Valid @RequestBody ReenvioVerificacionDTO dto) {
        String correo = dto.getCorreo().trim().toLowerCase();
        uS.list().stream()
                .filter(u -> correo.equalsIgnoreCase(u.getCorreo()))
                .findFirst()
                .ifPresent(vS::generarRecuperacion);

        return ResponseEntity.ok(new VerificacionDTO(
                "Si el correo está registrado, te enviamos un link para cambiar tu contraseña. Revisa tu bandeja de entrada.",
                null, correo));
    }

    @Operation(summary = "Restablecer la contraseña",
            description = "Recibe el token del link de recuperación y la contraseña nueva.")
    @PutMapping("/restablecer")
    public ResponseEntity<VerificacionDTO> restablecer(@Valid @RequestBody RestablecerPasswordDTO dto) {
        Verificacion v = vS.buscarPorToken(dto.getToken())
                .filter(x -> "RECUPERACION".equals(x.getTipo()))
                .orElseThrow(() ->
                        new ResourceNotFoundException("El link para cambiar la contraseña no es válido.")
                );
        if (Boolean.TRUE.equals(v.getUsado())) {
            throw new OperacionNoPermitidaException("Este link ya se usó. Pide uno nuevo si lo necesitas.");
        }
        if (v.getFechaExpira().isBefore(LocalDateTime.now())) {
            throw new OperacionNoPermitidaException("El link venció. Pide uno nuevo con tu correo.");
        }

        Usuario usuario = v.getUsuario();
        usuario.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        uS.update(usuario);
        v.setUsado(true);
        vS.update(v);

        return ResponseEntity.ok(new VerificacionDTO("Tu contraseña se cambió. Ya puedes ingresar.",
                usuario.getUsername(), usuario.getCorreo()));
    }
}
