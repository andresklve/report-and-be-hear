package pe.edu.upc.reportandbeheard.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Suspension de una cuenta por comentarios ofensivos o reportes falsos.
// Esta vigente mientras activa = true y fechaFin sea nula (indefinida) o futura.
@Entity
@Table(name = "suspensiones")
public class Suspension {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_suspension")
    private Long idSuspension;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_moderador", nullable = false)
    private Usuario usuarioModerador;

    @Column(name = "motivo", length = 30, nullable = false)
    private String motivo;

    @Column(name = "detalle", length = 500)
    private String detalle;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio = LocalDateTime.now();

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(name = "activa", nullable = false)
    private Boolean activa = true;

    public Suspension() {}

    public boolean estaVigente() {
        return Boolean.TRUE.equals(activa) && (fechaFin == null || fechaFin.isAfter(LocalDateTime.now()));
    }

    public Long getIdSuspension() { return idSuspension; }
    public void setIdSuspension(Long idSuspension) { this.idSuspension = idSuspension; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public Usuario getUsuarioModerador() { return usuarioModerador; }
    public void setUsuarioModerador(Usuario usuarioModerador) { this.usuarioModerador = usuarioModerador; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
    public String getDetalle() { return detalle; }
    public void setDetalle(String detalle) { this.detalle = detalle; }
    public LocalDateTime getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDateTime fechaInicio) { this.fechaInicio = fechaInicio; }
    public LocalDateTime getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDateTime fechaFin) { this.fechaFin = fechaFin; }
    public Boolean getActiva() { return activa; }
    public void setActiva(Boolean activa) { this.activa = activa; }
}
