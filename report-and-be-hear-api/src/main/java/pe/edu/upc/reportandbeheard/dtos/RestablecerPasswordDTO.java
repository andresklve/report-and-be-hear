package pe.edu.upc.reportandbeheard.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Token del link de recuperacion y la contrasena nueva
public class RestablecerPasswordDTO {

    @NotBlank(message = "El link no es válido.")
    private String token;

    @NotBlank(message = "La contraseña es obligatoria.")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres.")
    private String password;

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
