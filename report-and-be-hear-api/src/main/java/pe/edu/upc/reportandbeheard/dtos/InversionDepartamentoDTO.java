package pe.edu.upc.reportandbeheard.dtos;

import java.math.BigDecimal;

public class InversionDepartamentoDTO {
    private String departamento;
    private BigDecimal totalInversion;

    public InversionDepartamentoDTO(String departamento, BigDecimal totalInversion) {
        this.departamento = departamento;
        this.totalInversion = totalInversion;
    }

    public String getDepartamento() {
        return departamento;
    }

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }

    public BigDecimal getTotalInversion() {
        return totalInversion;
    }

    public void setTotalInversion(BigDecimal totalInversion) {
        this.totalInversion = totalInversion;
    }
}
