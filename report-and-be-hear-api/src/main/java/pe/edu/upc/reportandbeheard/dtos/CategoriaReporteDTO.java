package pe.edu.upc.reportandbeheard.dtos;

public class CategoriaReporteDTO {
    private Long idCategoria;
    private String nombreCategoria;
    private long cantidadTestimonios;

    public CategoriaReporteDTO() {
    }

    public CategoriaReporteDTO(Long idCategoria, String nombreCategoria, long cantidadTestimonios) {
        this.idCategoria = idCategoria;
        this.nombreCategoria = nombreCategoria;
        this.cantidadTestimonios = cantidadTestimonios;
    }

    public Long getIdCategoria() {
        return idCategoria;
    }

    public void setIdCategoria(Long idCategoria) {
        this.idCategoria = idCategoria;
    }

    public String getNombreCategoria() {
        return nombreCategoria;
    }

    public void setNombreCategoria(String nombreCategoria) {
        this.nombreCategoria = nombreCategoria;
    }

    public long getCantidadTestimonios() {
        return cantidadTestimonios;
    }

    public void setCantidadTestimonios(long cantidadTestimonios) {
        this.cantidadTestimonios = cantidadTestimonios;
    }
}
