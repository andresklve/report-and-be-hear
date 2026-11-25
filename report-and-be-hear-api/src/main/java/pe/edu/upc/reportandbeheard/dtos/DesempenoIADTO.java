package pe.edu.upc.reportandbeheard.dtos;

public class DesempenoIADTO {
    private String nombreCategoria;
    private String modeloIA;
    private Double confianzaPromedio;

    public DesempenoIADTO(String nombreCategoria, String modeloIA, Double confianzaPromedio) {
        this.nombreCategoria = nombreCategoria;
        this.modeloIA = modeloIA;
        this.confianzaPromedio = confianzaPromedio;
    }

    public String getNombreCategoria() {
        return nombreCategoria;
    }

    public void setNombreCategoria(String nombreCategoria) {
        this.nombreCategoria = nombreCategoria;
    }

    public String getModeloIA() {
        return modeloIA;
    }

    public void setModeloIA(String modeloIA) {
        this.modeloIA = modeloIA;
    }

    public Double getConfianzaPromedio() {
        return confianzaPromedio;
    }

    public void setConfianzaPromedio(Double confianzaPromedio) {
        this.confianzaPromedio = confianzaPromedio;
    }
}
