package pe.edu.upc.reportandbeheard.dtos;

import jakarta.validation.constraints.NotBlank;

public class RolDTO {
    private Long idRol;

    @NotBlank(message = "El nombre del rol es obligatorio.")
    private String nombreRol;

    private String descripcionRol;

    public Long getIdRol() {
        return idRol;
    }

    public void setIdRol(Long idRol) {
        this.idRol = idRol;
    }

    public String getNombreRol() {
        return nombreRol;
    }

    public void setNombreRol(String nombreRol) {
        this.nombreRol = nombreRol;
    }

    public String getDescripcionRol() {
        return descripcionRol;
    }

    public void setDescripcionRol(String descripcionRol) {
        this.descripcionRol = descripcionRol;
    }
}
