package pe.edu.upc.reportandbeheard.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RestablecerPasswordDTO(
        @NotBlank(message = "El token es obligatorio.")
        @Schema(description = "Token recibido en el enlace del correo") String token,
        @NotBlank(message = "La nueva contraseña es obligatoria.")
        @Size(min = 6, max = 100, message = "La contraseña debe tener entre 6 y 100 caracteres.")
        @Schema(example = "NuevaClave123") String nuevaPassword
) {
}
