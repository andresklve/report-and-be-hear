package pe.edu.upc.reportandbeheard.dtos;

// Resultado de clasificar un reclamo: categoria sugerida, direccion encontrada en el texto,
// confianza (0 a 1) y el modelo que hizo la clasificacion ("reglas" si no se uso la IA)
public class ClasificacionIADTO {
    private Long idCategoria;
    private String nombreCategoria;
    private String direccionTextoExtraida;
    private Double confianzaIA;
    private String modeloIA;

    public ClasificacionIADTO() {}

    public ClasificacionIADTO(Long idCategoria, String nombreCategoria, String direccionTextoExtraida,
                              Double confianzaIA, String modeloIA) {
        this.idCategoria = idCategoria;
        this.nombreCategoria = nombreCategoria;
        this.direccionTextoExtraida = direccionTextoExtraida;
        this.confianzaIA = confianzaIA;
        this.modeloIA = modeloIA;
    }

    public Long getIdCategoria() { return idCategoria; }
    public void setIdCategoria(Long idCategoria) { this.idCategoria = idCategoria; }
    public String getNombreCategoria() { return nombreCategoria; }
    public void setNombreCategoria(String nombreCategoria) { this.nombreCategoria = nombreCategoria; }
    public String getDireccionTextoExtraida() { return direccionTextoExtraida; }
    public void setDireccionTextoExtraida(String direccionTextoExtraida) { this.direccionTextoExtraida = direccionTextoExtraida; }
    public Double getConfianzaIA() { return confianzaIA; }
    public void setConfianzaIA(Double confianzaIA) { this.confianzaIA = confianzaIA; }
    public String getModeloIA() { return modeloIA; }
    public void setModeloIA(String modeloIA) { this.modeloIA = modeloIA; }
}
