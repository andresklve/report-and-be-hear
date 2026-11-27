package pe.edu.upc.reportandbeheard.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Link que se envia al correo del usuario. Se usa una sola vez.
// tipo REGISTRO: activa la cuenta (vence en 24 horas).
// tipo RECUPERACION: permite poner una contrasena nueva (vence en 1 hora).
@Entity
@Table(name = "verificaciones")
public class Verificacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_verificacion")
    private Long idVerificacion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "token", length = 64, nullable = false, unique = true)
    private String token;

    // REGISTRO o RECUPERACION (nulo en tokens antiguos = REGISTRO)
    @Column(name = "tipo", length = 20)
    private String tipo = "REGISTRO";

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "fecha_expira", nullable = false)
    private LocalDateTime fechaExpira;

    @Column(name = "usado", nullable = false)
    private Boolean usado = false;

    public Verificacion() {}

    public Long getIdVerificacion() { return idVerificacion; }
    public void setIdVerificacion(Long idVerificacion) { this.idVerificacion = idVerificacion; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public LocalDateTime getFechaExpira() { return fechaExpira; }
    public void setFechaExpira(LocalDateTime fechaExpira) { this.fechaExpira = fechaExpira; }
    public Boolean getUsado() { return usado; }
    public void setUsado(Boolean usado) { this.usado = usado; }
}
