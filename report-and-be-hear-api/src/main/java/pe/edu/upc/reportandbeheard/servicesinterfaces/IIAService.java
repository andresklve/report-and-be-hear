package pe.edu.upc.reportandbeheard.servicesinterfaces;

import pe.edu.upc.reportandbeheard.dtos.ClasificacionIADTO;

public interface IIAService {
    // Clasifica el texto de un reclamo (US37/US38)
    ClasificacionIADTO clasificar(String texto);
}
