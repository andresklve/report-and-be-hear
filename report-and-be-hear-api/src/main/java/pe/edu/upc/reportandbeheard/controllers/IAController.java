package pe.edu.upc.reportandbeheard.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.upc.reportandbeheard.dtos.ClasificacionIADTO;
import pe.edu.upc.reportandbeheard.dtos.ClasificacionIARequestDTO;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IIAService;

@RestController
@RequestMapping("/apis/ia")
public class IAController {
    private final IIAService iaS;

    public IAController(IIAService iaS) {
        this.iaS = iaS;
    }

    @Operation(summary = "Clasificar un reclamo con IA (US37/US38)",
            description = "Sugiere la categoría, extrae la dirección del texto y devuelve la confianza (0 a 1) "
                    + "y el modelo usado. Usa Google Gemini; si no está disponible, usa reglas por palabras clave.")
    @PostMapping("/clasificar")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'CIUDADANO')")
    public ResponseEntity<ClasificacionIADTO> clasificar(@Valid @RequestBody ClasificacionIARequestDTO dto) {
        return ResponseEntity.ok(iaS.clasificar(dto.getTexto()));
    }
}
