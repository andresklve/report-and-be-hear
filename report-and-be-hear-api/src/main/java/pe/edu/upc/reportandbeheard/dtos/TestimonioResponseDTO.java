package pe.edu.upc.reportandbeheard.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

public class TestimonioResponseDTO {
    @Schema(description = "Identificador del testimonio", example = "1")
    private Long idTestimonio;

    @Schema(description = "Identificador del usuario", example = "10")
    private Long idUsuario;

    @Schema(description = "Identificador de la categoría", example = "2")
    private Long idCategoria;

    @Schema(description = "Identificador de la zona", example = "3")
    private Long idZona;

    @Schema(description = "Texto del testimonio", example = "El servicio recibido fue excelente y oportuno.")
    private String descripcionTexto;

    @Schema(description = "URL de la foto adjunta", example = "https://example.com/foto.jpg")
    private String fotoUrl;

    @Schema(description = "Dirección extraída del texto", example = "Jr. Lima 120, Arequipa")
    private String direccionTextoExtraida;

    @Schema(description = "Latitud geográfica", example = "-16.409047")
    private BigDecimal latitud;

    @Schema(description = "Longitud geográfica", example = "-71.537451")
    private BigDecimal longitud;

    @Schema(description = "Estado del testimonio", example = "PENDIENTE")
    private String estado;

    @Schema(description = "Nivel de confianza de la IA (0 a 1)", example = "0.87")
    private Double confianzaIA;

    @Schema(description = "Modelo de IA que clasificó el testimonio", example = "gemini-2.0-flash")
    private String modeloIA;

    public Long getIdTestimonio() {
        return idTestimonio;
    }

    public void setIdTestimonio(Long idTestimonio) {
        this.idTestimonio = idTestimonio;
    }

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
