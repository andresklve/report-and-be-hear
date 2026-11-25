package pe.edu.upc.reportandbeheard.dtos;

import java.time.LocalDateTime;

public class NotificacionDTO {
    private Long idNotificacion;
    private Long idUsuario;
    private Long idTestimonio;
    private String tipo;
    private String mensaje;
    private Boolean leida;
    private LocalDateTime fechaCreacion;

    public Long getIdNotificacion() { return idNotificacion; }
    public void setIdNotificacion(Long idNotificacion) { this.idNotificacion = idNotificacion; }
    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }
    public Long getIdTestimonio() { return idTestimonio; }
    public void setIdTestimonio(Long idTestimonio) { this.idTestimonio = idTestimonio; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    public Boolean getLeida() { return leida; }
    public void setLeida(Boolean leida) { this.leida = leida; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
