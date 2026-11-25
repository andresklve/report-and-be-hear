package pe.edu.upc.reportandbeheard.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record OlvidePasswordDTO(
        @NotBlank(message = "El correo es obligatorio.")
        @Email(message = "El correo no tiene un formato válido.")
        @Schema(example = "ciudadano@correo.com") String correo
) {
}
