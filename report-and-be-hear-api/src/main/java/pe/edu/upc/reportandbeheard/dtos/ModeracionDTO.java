package pe.edu.upc.reportandbeheard.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ModeracionDTO {
    private Long idModeracion;

    @NotNull(message = "El testimonio es obligatorio.")
    private Long idTestimonio;

    @NotNull(message = "El usuario administrador es obligatorio.")
    private Long idUsuarioAdmin;

    @NotBlank(message = "La acción es obligatoria.")
    private String accion;

    private String motivo;

    private BigDecimal costo;

    private LocalDateTime fechaAccion;

    public Long getIdModeracion() {
        return idModeracion;
    }

    public void setIdModeracion(Long idModeracion) {
        this.idModeracion = idModeracion;
    }

    public Long getIdTestimonio() {
        return idTestimonio;
    }

    public void setIdTestimonio(Long idTestimonio) {
        this.idTestimonio = idTestimonio;
    }

    public Long getIdUsuarioAdmin() {
        return idUsuarioAdmin;
    }

    public void setIdUsuarioAdmin(Long idUsuarioAdmin) {
        this.idUsuarioAdmin = idUsuarioAdmin;
    }

    public String getAccion() {
        return accion;
    }

    public void setAccion(String accion) {
        this.accion = accion;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public BigDecimal getCosto() {
        return costo;
    }

    public void setCosto(BigDecimal costo) {
        this.costo = costo;
    }

    public LocalDateTime getFechaAccion() {
        return fechaAccion;
    }

    public void setFechaAccion(LocalDateTime fechaAccion) {
        this.fechaAccion = fechaAccion;
    }
}
