package pe.edu.upc.reportandbeheard.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// Correo al que se vuelve a enviar el link de verificacion
public class ReenvioVerificacionDTO {

    @NotBlank(message = "El correo es obligatorio.")
    @Email(message = "Escribe un correo válido.")
    private String correo;

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
}
