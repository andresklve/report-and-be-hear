package pe.edu.upc.reportandbeheard.dtos;

// Un problema distinto encontrado en el reclamo: su categoria, la confianza (0 a 1)
// y el fragmento del texto que habla de ese problema
public class OpcionCategoriaDTO {
    private Long idCategoria;
    private String nombreCategoria;
    private Double confianza;
    private String fragmento;

    public OpcionCategoriaDTO() {}

    public OpcionCategoriaDTO(Long idCategoria, String nombreCategoria, Double confianza, String fragmento) {
        this.idCategoria = idCategoria;
        this.nombreCategoria = nombreCategoria;
        this.confianza = confianza;
        this.fragmento = fragmento;
    }

    public Long getIdCategoria() { return idCategoria; }
    public void setIdCategoria(Long idCategoria) { this.idCategoria = idCategoria; }
    public String getNombreCategoria() { return nombreCategoria; }
    public void setNombreCategoria(String nombreCategoria) { this.nombreCategoria = nombreCategoria; }
    public Double getConfianza() { return confianza; }
    public void setConfianza(Double confianza) { this.confianza = confianza; }
    public String getFragmento() { return fragmento; }
    public void setFragmento(String fragmento) { this.fragmento = fragmento; }
}
