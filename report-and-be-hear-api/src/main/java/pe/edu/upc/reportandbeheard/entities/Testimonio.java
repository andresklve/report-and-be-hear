package pe.edu.upc.reportandbeheard.entities;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "testimonios")
public class Testimonio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_testimonio")
    private Long idTestimonio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria", nullable = false)
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_zona", nullable = false)
    private Zona zona;

    @Column(name = "descripcion_texto", columnDefinition = "TEXT", nullable = false)
    private String descripcionTexto;

    @Column(name = "foto_url", length = 500)
    private String fotoUrl;

    @Column(name = "direccion_texto_extraida", length = 255)
    private String direccionTextoExtraida;

    @Column(name = "latitud", precision = 9, scale = 6)
    private BigDecimal latitud;

    @Column(name = "longitud", precision = 9, scale = 6)
    private BigDecimal longitud;

    @Column(name = "estado", length = 20)
    private String estado;

    @Column(name = "confianza_ia")
    private Double confianzaIA;

    @Column(name = "modelo_ia", length = 50)
    private String modeloIA;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    public Testimonio() {
    }

    public Testimonio(Long idTestimonio, Usuario usuario, Categoria categoria, Zona zona,
                      String descripcionTexto, String fotoUrl, String direccionTextoExtraida,
                      BigDecimal latitud, BigDecimal longitud, String estado,
                      LocalDateTime fechaCreacion, LocalDateTime fechaActualizacion) {
        this.idTestimonio = idTestimonio;
        this.usuario = usuario;
        this.categoria = categoria;
        this.zona = zona;
        this.descripcionTexto = descripcionTexto;
        this.fotoUrl = fotoUrl;
        this.direccionTextoExtraida = direccionTextoExtraida;
        this.latitud = latitud;
        this.longitud = longitud;
        this.estado = estado;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
    }

    public Long getIdTestimonio() {
        return idTestimonio;
    }

    public void setIdTestimonio(Long idTestimonio) {
        this.idTestimonio = idTestimonio;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public Zona getZona() {
        return zona;
    }

    public void setZona(Zona zona) {
        this.zona = zona;
    }

    public String getDescripcionTexto() {
        return descripcionTexto;
    }

    public void setDescripcionTexto(String descripcionTexto) {
        this.descripcionTexto = descripcionTexto;
    }

    public String getFotoUrl() {
        return fotoUrl;
    }

    public void setFotoUrl(String fotoUrl) {
        this.fotoUrl = fotoUrl;
    }

    public String getDireccionTextoExtraida() {
        return direccionTextoExtraida;
    }

    public void setDireccionTextoExtraida(String direccionTextoExtraida) {
        this.direccionTextoExtraida = direccionTextoExtraida;
    }

    public BigDecimal getLatitud() {
        return latitud;
    }

    public void setLatitud(BigDecimal latitud) {
        this.latitud = latitud;
    }

    public BigDecimal getLongitud() {
        return longitud;
    }

    public void setLongitud(BigDecimal longitud) {
        this.longitud = longitud;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Double getConfianzaIA() {
        return confianzaIA;
    }

    public void setConfianzaIA(Double confianzaIA) {
        this.confianzaIA = confianzaIA;
    }

    public String getModeloIA() {
        return modeloIA;
    }

    public void setModeloIA(String modeloIA) {
        this.modeloIA = modeloIA;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
}
