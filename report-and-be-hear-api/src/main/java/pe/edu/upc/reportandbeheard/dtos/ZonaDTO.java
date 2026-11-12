package pe.edu.upc.reportandbeheard.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ZonaDTO {
    private Long idZona;

    @NotBlank(message = "El nombre de la zona es obligatorio.")
    private String nombreZona;

    @NotBlank(message = "La provincia es obligatoria.")
    private String provinciaZona;

    @NotBlank(message = "El departamento es obligatorio.")
    private String departamentoZona;

    @NotNull(message = "La latitud es obligatoria.")
    private Double latitudZona;

    @NotNull(message = "La longitud es obligatoria.")
    private Double longitudZona;

    public Long getIdZona() {
        return idZona;
    }

    public void setIdZona(Long idZona) {
        this.idZona = idZona;
    }

    public String getNombreZona() {
        return nombreZona;
    }

    public void setNombreZona(String nombreZona) {
        this.nombreZona = nombreZona;
    }

    public String getProvinciaZona() {
        return provinciaZona;
    }

    public void setProvinciaZona(String provinciaZona) {
        this.provinciaZona = provinciaZona;
    }

    public String getDepartamentoZona() {
        return departamentoZona;
    }

    public void setDepartamentoZona(String departamentoZona) {
        this.departamentoZona = departamentoZona;
    }

    public Double getLatitudZona() {
        return latitudZona;
    }

    public void setLatitudZona(Double latitudZona) {
        this.latitudZona = latitudZona;
    }

    public Double getLongitudZona() {
        return longitudZona;
    }

    public void setLongitudZona(Double longitudZona) {
        this.longitudZona = longitudZona;
    }
}
