package pe.edu.upc.reportandbeheard.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.upc.reportandbeheard.dtos.MensajeDTO;
import pe.edu.upc.reportandbeheard.dtos.OlvidePasswordDTO;
import pe.edu.upc.reportandbeheard.dtos.OlvidePasswordRespuestaDTO;
import pe.edu.upc.reportandbeheard.dtos.RestablecerPasswordDTO;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IEmailService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IPasswordResetService;

// "Olvide mi contrasena": endpoints publicos
@RestController
@RequestMapping("/auth")
public class PasswordController {
    private final IPasswordResetService prS;
    private final IEmailService emailService;
    private final boolean correoDemo;

    public PasswordController(IPasswordResetService prS, IEmailService emailService,
                              @Value("${app.mail.demo:true}") boolean correoDemo) {
        this.prS = prS;
        this.emailService = emailService;
        this.correoDemo = correoDemo;
    }

    @Operation(summary = "Olvidé mi contraseña",
            description = "Envía al correo un enlace para restablecer la contraseña (válido 30 minutos). "
                    + "Responde lo mismo exista o no el correo.")
    @PostMapping("/olvide-password")
    public ResponseEntity<OlvidePasswordRespuestaDTO> olvidePassword(@Valid @RequestBody OlvidePasswordDTO dto) {
        String enlace = prS.solicitar(dto.correo());
        return ResponseEntity.ok(new OlvidePasswordRespuestaDTO(
                "Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.",
                // Sin Gmail configurado (desarrollo) se devuelve el enlace para poder probar
                correoDemo && !emailService.correoReal() ? enlace : null));
    }

    @Operation(summary = "Restablecer contraseña", description = "Usa el token del enlace del correo. Sirve una sola vez.")
    @PostMapping("/restablecer-password")
    public ResponseEntity<MensajeDTO> restablecer(@Valid @RequestBody RestablecerPasswordDTO dto) {
        prS.restablecer(dto.token(), dto.nuevaPassword());
        return ResponseEntity.ok(new MensajeDTO("Tu contraseña fue actualizada. Ya puedes iniciar sesión."));
    }
}
