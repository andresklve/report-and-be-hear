package pe.edu.upc.reportandbeheard.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/** Token de un solo uso para restablecer la contraseña. Solo se guarda su hash SHA-256. */
@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token_hash", length = 64, nullable = false, unique = true)
    private String tokenHash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "expira", nullable = false)
    private LocalDateTime expira;

    @Column(name = "usado", nullable = false)
    private boolean usado = false;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    public PasswordResetToken() {
    }

    public PasswordResetToken(String tokenHash, Usuario usuario, LocalDateTime expira) {
        this.tokenHash = tokenHash;
        this.usuario = usuario;
        this.expira = expira;
        this.fechaCreacion = LocalDateTime.now();
    }

    public boolean esValido() {
        return !usado && expira.isAfter(LocalDateTime.now());
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTokenHash() { return tokenHash; }
    public void setTokenHash(String tokenHash) { this.tokenHash = tokenHash; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public LocalDateTime getExpira() { return expira; }
    public void setExpira(LocalDateTime expira) { this.expira = expira; }
    public boolean isUsado() { return usado; }
    public void setUsado(boolean usado) { this.usado = usado; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
