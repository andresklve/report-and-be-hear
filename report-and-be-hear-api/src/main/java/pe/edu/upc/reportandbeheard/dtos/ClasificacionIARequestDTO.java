package pe.edu.upc.reportandbeheard.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Texto del reclamo que se envia a la IA para clasificarlo
public class ClasificacionIARequestDTO {

    @NotBlank(message = "El texto del reclamo es obligatorio.")
    @Size(max = 2000, message = "El texto no puede superar los 2000 caracteres.")
    private String texto;

    public String getTexto() { return texto; }
    public void setTexto(String texto) { this.texto = texto; }
}
