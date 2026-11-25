package pe.edu.upc.reportandbeheard.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import pe.edu.upc.reportandbeheard.dtos.SuspensionDTO;
import pe.edu.upc.reportandbeheard.entities.Suspension;
import pe.edu.upc.reportandbeheard.entities.Usuario;
import pe.edu.upc.reportandbeheard.exceptions.OperacionNoPermitidaException;
import pe.edu.upc.reportandbeheard.exceptions.ResourceNotFoundException;
import pe.edu.upc.reportandbeheard.servicesinterfaces.INotificacionService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.ISuspensionService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IUsuarioService;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/apis/suspensiones")
public class SuspensionController {
    private static final Set<String> MOTIVOS = Set.of("COMENTARIO_OFENSIVO", "REPORTE_FALSO", "OTRO");

    private final ISuspensionService sS;
    private final IUsuarioService uS;
    private final INotificacionService nS;

    public SuspensionController(ISuspensionService sS, IUsuarioService uS, INotificacionService nS) {
        this.sS = sS;
        this.uS = uS;
        this.nS = nS;
    }

    @Operation(summary = "Listar suspensiones", description = "De la más reciente a la más antigua, con el estado vigente de cada una.")
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'MUNICIPALIDAD')")
    public ResponseEntity<List<SuspensionDTO>> listar() {
        return ResponseEntity.ok(sS.list().stream().map(this::toDTO).toList());
    }

    @Operation(summary = "Suspensión vigente de un usuario", description = "Devuelve 404 si el usuario no está suspendido.")
    @GetMapping("/usuario/{idUsuario}/vigente")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'CIUDADANO', 'MUNICIPALIDAD')")
    public ResponseEntity<SuspensionDTO> vigente(@PathVariable Long idUsuario) {
        Suspension suspension = sS.vigente(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("El usuario " + idUsuario + " no tiene una suspensión vigente."));
        return ResponseEntity.ok(toDTO(suspension));
    }

    @Operation(summary = "Suspender una cuenta", description = "Solo se suspenden cuentas de ciudadanos. Sin 'dias', la suspensión es indefinida.")
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'MUNICIPALIDAD')")
    public ResponseEntity<SuspensionDTO> registrar(@Valid @RequestBody SuspensionDTO dto) {
        Usuario usuario = buscarUsuario(dto.getIdUsuario());
        Usuario moderador = buscarUsuario(dto.getIdUsuarioModerador());

        if (!"CIUDADANO".equals(usuario.getRol().getNombreRol())) {
            throw new OperacionNoPermitidaException("Solo se pueden suspender cuentas de ciudadanos.");
        }
        if (!MOTIVOS.contains(dto.getMotivo())) {
            throw new OperacionNoPermitidaException("Motivo no válido. Use COMENTARIO_OFENSIVO, REPORTE_FALSO u OTRO.");
        }
        if (sS.vigente(usuario.getIdUsuario()).isPresent()) {
            throw new OperacionNoPermitidaException("Esta cuenta ya tiene una suspensión vigente.");
        }

        Suspension suspension = new Suspension();
        suspension.setUsuario(usuario);
        suspension.setUsuarioModerador(moderador);
        suspension.setMotivo(dto.getMotivo());
        suspension.setDetalle(dto.getDetalle());
        suspension.setFechaInicio(LocalDateTime.now());
        if (dto.getDias() != null) {
            suspension.setFechaFin(LocalDateTime.now().plusDays(dto.getDias()));
        }
        sS.insert(suspension);

        nS.notificar(usuario, null, "SUSPENSION", sS.mensajeSuspension(suspension));

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(suspension.getIdSuspension())
                .toUri();
        return ResponseEntity.created(location).body(toDTO(suspension));
    }

    @Operation(summary = "Levantar una suspensión", description = "La cuenta vuelve a poder ingresar, comentar, apoyar y reportar.")
    @PutMapping("/{id}/levantar")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'MUNICIPALIDAD')")
    public ResponseEntity<SuspensionDTO> levantar(@PathVariable Long id) {
        Suspension suspension = sS.listId(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe una suspensión con el id: " + id));
        suspension.setActiva(false);
        sS.update(suspension);
        nS.notificar(suspension.getUsuario(), null, "SUSPENSION", "Se levantó la suspensión de tu cuenta.");
        return ResponseEntity.ok(toDTO(suspension));
    }

    private Usuario buscarUsuario(Long idUsuario) {
        return uS.listId(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un usuario con el id: " + idUsuario));
    }

    private SuspensionDTO toDTO(Suspension suspension) {
        SuspensionDTO dto = new SuspensionDTO();
        dto.setIdSuspension(suspension.getIdSuspension());
        dto.setIdUsuario(suspension.getUsuario().getIdUsuario());
        dto.setIdUsuarioModerador(suspension.getUsuarioModerador().getIdUsuario());
        dto.setMotivo(suspension.getMotivo());
        dto.setDetalle(suspension.getDetalle());
        dto.setFechaInicio(suspension.getFechaInicio());
        dto.setFechaFin(suspension.getFechaFin());
        dto.setActiva(suspension.getActiva());
        dto.setVigente(suspension.estaVigente());
        dto.setNombreUsuario(suspension.getUsuario().getNombres() + " " + suspension.getUsuario().getApellidos());
        dto.setUsernameUsuario(suspension.getUsuario().getUsername());
        return dto;
    }
}
