package pe.edu.upc.reportandbeheard.dtos;

public class TiempoAtencionDTO {
    private Double diasPromedio;

    public TiempoAtencionDTO(Double diasPromedio) {
        this.diasPromedio = diasPromedio;
    }

    public Double getDiasPromedio() {
        return diasPromedio;
    }

    public void setDiasPromedio(Double diasPromedio) {
        this.diasPromedio = diasPromedio;
    }
}
