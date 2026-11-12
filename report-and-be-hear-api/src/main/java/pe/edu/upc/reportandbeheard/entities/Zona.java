package pe.edu.upc.reportandbeheard.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "zonas")
public class Zona {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idZona;

    @Column(name = "nombreZona", length = 100, nullable = false)
    private String nombreZona;

    @Column(name = "provinciaZona", length = 100, nullable = false)
    private String provinciaZona;

    @Column(name = "departamentoZona", length = 100, nullable = false)
    private String departamentoZona;

    @Column(name = "latitudZona", nullable = false)
    private double latitudZona;

    @Column(name = "longitudZona", nullable = false)
    private double longitudZona;

    public Zona() {
    }

    public Zona(Long idZona, String nombreZona, String provinciaZona, String departamentoZona, double latitudZona, double longitudZona) {
        this.idZona = idZona;
        this.nombreZona = nombreZona;
        this.provinciaZona = provinciaZona;
        this.departamentoZona = departamentoZona;
        this.latitudZona = latitudZona;
        this.longitudZona = longitudZona;
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

    public String getProvinciaZona() {
        return provinciaZona;
    }

    public void setProvinciaZona(String provinciaZona) {
        this.provinciaZona = provinciaZona;
    }

    public String getDepartamentoZona() {
        return departamentoZona;
    }

    public void setDepartamentoZona(String departamentoZona) {
        this.departamentoZona = departamentoZona;
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
}
