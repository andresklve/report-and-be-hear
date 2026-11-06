package pe.edu.upc.reportandbeheard.dtos;

import java.math.BigDecimal;

public class CostoCategoriaDTO {
    private String categoria;
    private BigDecimal totalCosto;

    public CostoCategoriaDTO(String categoria, BigDecimal totalCosto) {
        this.categoria = categoria;
        this.totalCosto = totalCosto;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public BigDecimal getTotalCosto() {
        return totalCosto;
    }

    public void setTotalCosto(BigDecimal totalCosto) {
        this.totalCosto = totalCosto;
    }
}
