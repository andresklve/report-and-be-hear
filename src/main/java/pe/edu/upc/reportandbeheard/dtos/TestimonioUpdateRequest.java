package pe.edu.upc.reportandbeheard.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class TestimonioUpdateRequest {
    @NotNull(message = "El id del usuario es obligatorio.")
    private Long idUsuario;

    @NotNull(message = "El id de la categoría es obligatorio.")
    private Long idCategoria;

    @NotNull(message = "El id de la zona es obligatorio.")
    private Long idZona;

    @NotBlank(message = "La descripción del testimonio es obligatoria.")
    @Size(max = 5000, message = "La descripción no puede exceder 5000 caracteres.")
    private String descripcionTexto;

    private String fotoUrl;
    private String direccionTextoExtraida;

    @NotNull(message = "La latitud es obligatoria.")
    @DecimalMin(value = "-90.0", message = "La latitud debe estar entre -90 y 90.")
    @DecimalMax(value = "90.0", message = "La latitud debe estar entre -90 y 90.")
    private BigDecimal latitud;

    @NotNull(message = "La longitud es obligatoria.")
    @DecimalMin(value = "-180.0", message = "La longitud debe estar entre -180 y 180.")
    @DecimalMax(value = "180.0", message = "La longitud debe estar entre -180 y 180.")
    private BigDecimal longitud;

    @NotBlank(message = "El estado del testimonio es obligatorio.")
    private String estado;

    @DecimalMin(value = "0.0", message = "La confianza de la IA debe estar entre 0 y 1.")
    @DecimalMax(value = "1.0", message = "La confianza de la IA debe estar entre 0 y 1.")
    @Schema(description = "Nivel de confianza de la IA al clasificar el testimonio (0 a 1). Opcional.", example = "0.87")
    private Double confianzaIA;

    @Size(max = 50, message = "El modelo de IA no puede exceder 50 caracteres.")
    @Schema(description = "Nombre del modelo de IA que clasificó el testimonio. Opcional.", example = "gemini-2.0-flash")
    private String modeloIA;

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public Long getIdCategoria() {
        return idCategoria;
    }

    public void setIdCategoria(Long idCategoria) {
        this.idCategoria = idCategoria;
    }

    public Long getIdZona() {
        return idZona;
    }

    public void setIdZona(Long idZona) {
        this.idZona = idZona;
    }

    public String getDescripcionTexto() {
        return descripcionTexto;
    }

    public void setDescripcionTexto(String descripcionTexto) {
        this.descripcionTexto = descripcionTexto;
    }

    public String getFotoUrl() {
        return fotoUrl;
    }

    public void setFotoUrl(String fotoUrl) {
        this.fotoUrl = fotoUrl;
    }

    public String getDireccionTextoExtraida() {
        return direccionTextoExtraida;
    }

    public void setDireccionTextoExtraida(String direccionTextoExtraida) {
        this.direccionTextoExtraida = direccionTextoExtraida;
    }

    public BigDecimal getLatitud() {
        return latitud;
    }

    public void setLatitud(BigDecimal latitud) {
        this.latitud = latitud;
    }

    public BigDecimal getLongitud() {
        return longitud;
    }

    public void setLongitud(BigDecimal longitud) {
        this.longitud = longitud;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Double getConfianzaIA() {
        return confianzaIA;
    }

    public void setConfianzaIA(Double confianzaIA) {
        this.confianzaIA = confianzaIA;
    }

    public String getModeloIA() {
        return modeloIA;
    }

    public void setModeloIA(String modeloIA) {
        this.modeloIA = modeloIA;
    }
}
