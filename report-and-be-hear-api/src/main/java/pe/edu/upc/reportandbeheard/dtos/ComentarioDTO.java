package pe.edu.upc.reportandbeheard.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class ComentarioDTO {
    private Long idComentario;

    @NotNull(message = "El testimonio es obligatorio.")
    private Long idTestimonio;

    @NotNull(message = "El usuario es obligatorio.")
    private Long idUsuario;

    @NotBlank(message = "El comentario no puede estar vacío.")
    @Size(max = 500, message = "El comentario no puede pasar de 500 caracteres.")
    private String texto;

    private LocalDateTime fechaCreacion;

    // Solo lectura: nombre visible del autor (nombre y la inicial del apellido)
    private String nombreAutor;

    public Long getIdComentario() { return idComentario; }
    public void setIdComentario(Long idComentario) { this.idComentario = idComentario; }
    public Long getIdTestimonio() { return idTestimonio; }
    public void setIdTestimonio(Long idTestimonio) { this.idTestimonio = idTestimonio; }
    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }
    public String getTexto() { return texto; }
    public void setTexto(String texto) { this.texto = texto; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public String getNombreAutor() { return nombreAutor; }
    public void setNombreAutor(String nombreAutor) { this.nombreAutor = nombreAutor; }
}
