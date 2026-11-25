package pe.edu.upc.reportandbeheard.dtos;

public class RankingApoyoDTO {
    private Long idTestimonio;
    private Long totalApoyos;

    public RankingApoyoDTO(Long idTestimonio, Long totalApoyos) {
        this.idTestimonio = idTestimonio;
        this.totalApoyos = totalApoyos;
    }

    public Long getIdTestimonio() { return idTestimonio; }
    public void setIdTestimonio(Long idTestimonio) { this.idTestimonio = idTestimonio; }
    public Long getTotalApoyos() { return totalApoyos; }
    public void setTotalApoyos(Long totalApoyos) { this.totalApoyos = totalApoyos; }
}
