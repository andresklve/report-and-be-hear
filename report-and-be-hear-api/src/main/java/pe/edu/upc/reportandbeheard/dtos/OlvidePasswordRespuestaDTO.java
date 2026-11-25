package pe.edu.upc.reportandbeheard.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Respuesta de 'olvidé mi contraseña'")
public record OlvidePasswordRespuestaDTO(
        @Schema(example = "Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.") String mensaje,
        @Schema(description = "Solo en modo demostración (app.mail.demo=true): el enlace que llegaría por correo. "
                + "Es null si el modo está apagado o el correo no está registrado.") String enlaceDemo
) {
}
