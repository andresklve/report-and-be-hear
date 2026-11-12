package pe.edu.upc.reportandbeheard.dtos;

public class TendenciaTemporalDTO {
    private String periodo;
    private Long totalTestimonios;

    public TendenciaTemporalDTO(String periodo, Long totalTestimonios) {
        this.periodo = periodo;
        this.totalTestimonios = totalTestimonios;
    }

    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }
    public Long getTotalTestimonios() { return totalTestimonios; }
    public void setTotalTestimonios(Long totalTestimonios) { this.totalTestimonios = totalTestimonios; }
}