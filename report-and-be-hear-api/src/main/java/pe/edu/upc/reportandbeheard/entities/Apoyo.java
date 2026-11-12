package pe.edu.upc.reportandbeheard.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// "Me gusta" de un ciudadano a un testimonio: un usuario solo puede apoyar una vez cada testimonio
@Entity
@Table(name = "apoyos", uniqueConstraints = @UniqueConstraint(columnNames = {"id_testimonio", "id_usuario"}))
public class Apoyo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_apoyo")
    private Long idApoyo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_testimonio", nullable = false)
    private Testimonio testimonio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "fecha_apoyo", nullable = false)
    private LocalDateTime fechaApoyo = LocalDateTime.now();

    public Apoyo() {}

    public Long getIdApoyo() { return idApoyo; }
    public void setIdApoyo(Long idApoyo) { this.idApoyo = idApoyo; }
    public Testimonio getTestimonio() { return testimonio; }
    public void setTestimonio(Testimonio testimonio) { this.testimonio = testimonio; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public LocalDateTime getFechaApoyo() { return fechaApoyo; }
    public void setFechaApoyo(LocalDateTime fechaApoyo) { this.fechaApoyo = fechaApoyo; }
}
