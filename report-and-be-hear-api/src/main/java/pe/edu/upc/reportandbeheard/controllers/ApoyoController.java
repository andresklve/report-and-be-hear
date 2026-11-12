package pe.edu.upc.reportandbeheard.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.upc.reportandbeheard.dtos.ApoyoDTO;
import pe.edu.upc.reportandbeheard.dtos.ApoyoResumenDTO;
import pe.edu.upc.reportandbeheard.dtos.RankingApoyoDTO;
import pe.edu.upc.reportandbeheard.entities.Apoyo;
import pe.edu.upc.reportandbeheard.entities.Testimonio;
import pe.edu.upc.reportandbeheard.entities.Usuario;
import pe.edu.upc.reportandbeheard.exceptions.OperacionNoPermitidaException;
import pe.edu.upc.reportandbeheard.exceptions.ResourceNotFoundException;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IApoyoService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.ISuspensionService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.ITestimonioService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IUsuarioService;

import java.util.List;

@RestController
@RequestMapping("/apis/apoyos")
public class ApoyoController {
    private final IApoyoService aS;
    private final ITestimonioService tS;
    private final IUsuarioService uS;
    private final ISuspensionService sS;

    public ApoyoController(IApoyoService aS, ITestimonioService tS, IUsuarioService uS, ISuspensionService sS) {
        this.aS = aS;
        this.tS = tS;
        this.uS = uS;
        this.sS = sS;
    }

    @Operation(summary = "Apoyos de un testimonio", description = "Total de apoyos y, si se envía idUsuario, si ese usuario ya lo apoya.")
    @GetMapping("/testimonio/{idTestimonio}")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'CIUDADANO', 'MUNICIPALIDAD')")
    public ResponseEntity<ApoyoResumenDTO> resumen(@PathVariable Long idTestimonio,
                                                   @RequestParam(required = false) Long idUsuario) {
        buscarTestimonio(idTestimonio);
        return ResponseEntity.ok(resumenDe(idTestimonio, idUsuario));
    }

    @Operation(summary = "Ranking de testimonios más apoyados", description = "Testimonios con al menos un apoyo, ordenados de mayor a menor.")
    @GetMapping("/ranking")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'CIUDADANO', 'MUNICIPALIDAD')")
    public ResponseEntity<List<RankingApoyoDTO>> ranking() {
        return ResponseEntity.ok(aS.ranking());
    }

    @Operation(summary = "Apoyar un testimonio", description = "Registra el apoyo del usuario. No se puede apoyar el propio testimonio ni apoyar dos veces.")
    @PostMapping
    @PreAuthorize("hasAuthority('CIUDADANO')")
    public ResponseEntity<ApoyoResumenDTO> apoyar(@Valid @RequestBody ApoyoDTO dto) {
        Testimonio testimonio = buscarTestimonio(dto.getIdTestimonio());
        Usuario usuario = buscarUsuario(dto.getIdUsuario());
        sS.validarNoSuspendido(usuario.getIdUsuario());

        if (testimonio.getUsuario().getIdUsuario().equals(usuario.getIdUsuario())) {
            throw new OperacionNoPermitidaException("No puedes apoyar tu propio reporte.");
        }
        if (aS.buscar(testimonio.getIdTestimonio(), usuario.getIdUsuario()).isEmpty()) {
            Apoyo apoyo = new Apoyo();
            apoyo.setTestimonio(testimonio);
            apoyo.setUsuario(usuario);
            aS.insert(apoyo);
        }
        return ResponseEntity.ok(resumenDe(testimonio.getIdTestimonio(), usuario.getIdUsuario()));
    }

    @Operation(summary = "Quitar el apoyo", description = "Elimina el apoyo del usuario al testimonio, si existe.")
    @DeleteMapping("/testimonio/{idTestimonio}/usuario/{idUsuario}")
    @PreAuthorize("hasAuthority('CIUDADANO')")
    public ResponseEntity<ApoyoResumenDTO> quitar(@PathVariable Long idTestimonio, @PathVariable Long idUsuario) {
        buscarTestimonio(idTestimonio);
        aS.buscar(idTestimonio, idUsuario).ifPresent(a -> aS.delete(a.getIdApoyo()));
        return ResponseEntity.ok(resumenDe(idTestimonio, idUsuario));
    }

    private ApoyoResumenDTO resumenDe(Long idTestimonio, Long idUsuario) {
        boolean apoyado = idUsuario != null && aS.buscar(idTestimonio, idUsuario).isPresent();
        return new ApoyoResumenDTO(idTestimonio, aS.contarPorTestimonio(idTestimonio), apoyado);
    }

    private Testimonio buscarTestimonio(Long idTestimonio) {
        return tS.listId(idTestimonio)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un testimonio con el id: " + idTestimonio));
    }

    private Usuario buscarUsuario(Long idUsuario) {
        return uS.listId(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un usuario con el id: " + idUsuario));
    }
}
