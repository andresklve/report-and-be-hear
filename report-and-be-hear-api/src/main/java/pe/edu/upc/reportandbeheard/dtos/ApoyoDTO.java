package pe.edu.upc.reportandbeheard.dtos;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class ApoyoDTO {
    private Long idApoyo;

    @NotNull(message = "El testimonio es obligatorio.")
    private Long idTestimonio;

    @NotNull(message = "El usuario es obligatorio.")
    private Long idUsuario;

    private LocalDateTime fechaApoyo;

    public Long getIdApoyo() { return idApoyo; }
    public void setIdApoyo(Long idApoyo) { this.idApoyo = idApoyo; }
    public Long getIdTestimonio() { return idTestimonio; }
    public void setIdTestimonio(Long idTestimonio) { this.idTestimonio = idTestimonio; }
    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }
    public LocalDateTime getFechaApoyo() { return fechaApoyo; }
    public void setFechaApoyo(LocalDateTime fechaApoyo) { this.fechaApoyo = fechaApoyo; }
}
