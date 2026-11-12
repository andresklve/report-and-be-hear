package pe.edu.upc.reportandbeheard.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public class SuspensionDTO {
    private Long idSuspension;

    @NotNull(message = "El usuario a suspender es obligatorio.")
    private Long idUsuario;

    @NotNull(message = "El usuario moderador es obligatorio.")
    private Long idUsuarioModerador;

    // COMENTARIO_OFENSIVO, REPORTE_FALSO u OTRO
    @NotBlank(message = "El motivo es obligatorio.")
    private String motivo;

    private String detalle;

    // Solo al registrar: dias de suspension. Si es nulo, la suspension es indefinida.
    @Positive(message = "Los días de suspensión deben ser mayores a cero.")
    private Integer dias;

    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private Boolean activa;

    // Solo lectura
    private Boolean vigente;
    private String nombreUsuario;
    private String usernameUsuario;

    public Long getIdSuspension() { return idSuspension; }
    public void setIdSuspension(Long idSuspension) { this.idSuspension = idSuspension; }
    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }
    public Long getIdUsuarioModerador() { return idUsuarioModerador; }
    public void setIdUsuarioModerador(Long idUsuarioModerador) { this.idUsuarioModerador = idUsuarioModerador; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public String getDetalle() { return detalle; }
    public void setDetalle(String detalle) { this.detalle = detalle; }
    public Integer getDias() { return dias; }
    public void setDias(Integer dias) { this.dias = dias; }
    public LocalDateTime getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDateTime fechaInicio) { this.fechaInicio = fechaInicio; }
    public LocalDateTime getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDateTime fechaFin) { this.fechaFin = fechaFin; }
    public Boolean getActiva() { return activa; }
    public void setActiva(Boolean activa) { this.activa = activa; }
    public Boolean getVigente() { return vigente; }
    public void setVigente(Boolean vigente) { this.vigente = vigente; }
    public String getNombreUsuario() { return nombreUsuario; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }
    public String getUsernameUsuario() { return usernameUsuario; }
    public void setUsernameUsuario(String usernameUsuario) { this.usernameUsuario = usernameUsuario; }
}
