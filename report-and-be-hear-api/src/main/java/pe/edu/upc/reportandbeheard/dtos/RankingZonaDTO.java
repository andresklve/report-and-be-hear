package pe.edu.upc.reportandbeheard.dtos;

public class RankingZonaDTO {
    private Long idZona;
    private String nombreZona;
    private Long totalTestimonios;

    public RankingZonaDTO(Long idZona, String nombreZona, Long totalTestimonios) {
        this.idZona = idZona;
        this.nombreZona = nombreZona;
        this.totalTestimonios = totalTestimonios;
    }

    public Long getIdZona() { return idZona; }
    public void setIdZona(Long idZona) { this.idZona = idZona; }
    public String getNombreZona() { return nombreZona; }
    public void setNombreZona(String nombreZona) { this.nombreZona = nombreZona; }
    public Long getTotalTestimonios() { return totalTestimonios; }
    public void setTotalTestimonios(Long totalTestimonios) { this.totalTestimonios = totalTestimonios; }
}