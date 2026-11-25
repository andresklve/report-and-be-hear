package pe.edu.upc.reportandbeheard.dtos;

public class MapaCalorDTO {
    private Long idZona;
    private String nombreZona;
    private double latitudZona;
    private double longitudZona;
    private long densidad;

    public MapaCalorDTO() {
    }

    public MapaCalorDTO(Long idZona, String nombreZona, double latitudZona, double longitudZona, long densidad) {
        this.idZona = idZona;
        this.nombreZona = nombreZona;
        this.latitudZona = latitudZona;
        this.longitudZona = longitudZona;
        this.densidad = densidad;
    }

    public Long getIdZona() {
        return idZona;
    }

    public void setIdZona(Long idZona) {
        this.idZona = idZona;
    }

    public String getNombreZona() {
        return nombreZona;
    }

    public void setNombreZona(String nombreZona) {
        this.nombreZona = nombreZona;
    }

    public double getLatitudZona() {
        return latitudZona;
    }

    public void setLatitudZona(double latitudZona) {
        this.latitudZona = latitudZona;
    }

    public double getLongitudZona() {
        return longitudZona;
    }

    public void setLongitudZona(double longitudZona) {
        this.longitudZona = longitudZona;
    }

    public long getDensidad() {
        return densidad;
    }

    public void setDensidad(long densidad) {
        this.densidad = densidad;
    }
}
