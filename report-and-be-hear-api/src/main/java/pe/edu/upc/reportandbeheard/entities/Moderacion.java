package pe.edu.upc.reportandbeheard.entities;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "moderaciones")
public class Moderacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_moderacion")
    private Long idModeracion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_testimonio", nullable = false)
    private Testimonio testimonio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_admin", nullable = false)
    private Usuario usuarioAdmin;

    @Column(name = "accion", length = 20, nullable = false)
    private String accion;

    @Column(name = "motivo", length = 255)
    private String motivo;

    @Column(name = "costo", precision = 10, scale = 2)
    private BigDecimal costo;

    @Column(name = "fecha_accion", nullable = false)
    private LocalDateTime fechaAccion = LocalDateTime.now();

    public Moderacion() {
    }

    public Moderacion(Long idModeracion, Testimonio testimonio, Usuario usuarioAdmin,
                     String accion, String motivo, BigDecimal costo, LocalDateTime fechaAccion) {
        this.idModeracion = idModeracion;
        this.testimonio = testimonio;
        this.usuarioAdmin = usuarioAdmin;
        this.accion = accion;
        this.motivo = motivo;
        this.costo = costo;
        this.fechaAccion = fechaAccion;
    }

    public Long getIdModeracion() {
        return idModeracion;
    }

    public void setIdModeracion(Long idModeracion) {
        this.idModeracion = idModeracion;
    }

    public Testimonio getTestimonio() {
        return testimonio;
    }

    public void setTestimonio(Testimonio testimonio) {
        this.testimonio = testimonio;
    }

    public Usuario getUsuarioAdmin() {
        return usuarioAdmin;
    }

    public void setUsuarioAdmin(Usuario usuarioAdmin) {
        this.usuarioAdmin = usuarioAdmin;
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
