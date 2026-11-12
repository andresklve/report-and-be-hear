package pe.edu.upc.reportandbeheard.dtos;

// Total de apoyos de un testimonio y si el usuario consultado ya lo apoya
public class ApoyoResumenDTO {
    private Long idTestimonio;
    private Long totalApoyos;
    private Boolean apoyadoPorUsuario;

    public ApoyoResumenDTO(Long idTestimonio, Long totalApoyos, Boolean apoyadoPorUsuario) {
        this.idTestimonio = idTestimonio;
        this.totalApoyos = totalApoyos;
        this.apoyadoPorUsuario = apoyadoPorUsuario;
    }

    public Long getIdTestimonio() { return idTestimonio; }
    public void setIdTestimonio(Long idTestimonio) { this.idTestimonio = idTestimonio; }
    public Long getTotalApoyos() { return totalApoyos; }
    public void setTotalApoyos(Long totalApoyos) { this.totalApoyos = totalApoyos; }
    public Boolean getApoyadoPorUsuario() { return apoyadoPorUsuario; }
    public void setApoyadoPorUsuario(Boolean apoyadoPorUsuario) { this.apoyadoPorUsuario = apoyadoPorUsuario; }
}
