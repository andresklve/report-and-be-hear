package pe.edu.upc.reportandbeheard.controllers;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import pe.edu.upc.reportandbeheard.dtos.ModeracionDTO;
import pe.edu.upc.reportandbeheard.entities.Moderacion;
import pe.edu.upc.reportandbeheard.entities.Testimonio;
import pe.edu.upc.reportandbeheard.entities.Usuario;
import pe.edu.upc.reportandbeheard.exceptions.ResourceNotFoundException;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IModeracionService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.INotificacionService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.ITestimonioService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IUsuarioService;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/apis/moderaciones")
public class ModeracionController {
    private final IModeracionService mS;
    private final ITestimonioService tS;
    private final IUsuarioService uS;
    private final INotificacionService nS;

    public ModeracionController(IModeracionService mS, ITestimonioService tS, IUsuarioService uS,
                                INotificacionService nS) {
        this.mS = mS;
        this.tS = tS;
        this.uS = uS;
        this.nS = nS;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'MUNICIPALIDAD')")
    public ResponseEntity<List<ModeracionDTO>> listar() {
        List<ModeracionDTO> lista = mS.list()
                .stream()
                .map(this::toDTO)
                .toList();

        return ResponseEntity.ok(lista);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'MUNICIPALIDAD')")
    public ResponseEntity<ModeracionDTO> registrar(@Valid @RequestBody ModeracionDTO dto) {
        Testimonio testimonio = buscarTestimonio(dto.getIdTestimonio());
        Usuario usuarioAdmin = buscarUsuario(dto.getIdUsuarioAdmin());

        Moderacion moderacion = new Moderacion();
        moderacion.setTestimonio(testimonio);
        moderacion.setUsuarioAdmin(usuarioAdmin);
        moderacion.setAccion(dto.getAccion());
        moderacion.setMotivo(dto.getMotivo());
        moderacion.setCosto(dto.getCosto());
        if (dto.getFechaAccion() != null) {
            moderacion.setFechaAccion(dto.getFechaAccion());
        }

        mS.insert(moderacion);
        notificarAutor(moderacion);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(moderacion.getIdModeracion())
                .toUri();

        return ResponseEntity
                .created(location)
                .body(toDTO(moderacion));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'MUNICIPALIDAD')")
    public ResponseEntity<ModeracionDTO> buscarPorId(@PathVariable Long id) {
        Moderacion moderacion = mS.listId(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("No existe una moderación con el id: " + id)
                );

        return ResponseEntity.ok(toDTO(moderacion));
    }

    @PutMapping
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'MUNICIPALIDAD')")
    public ResponseEntity<ModeracionDTO> actualizar(@Valid @RequestBody ModeracionDTO dto) {
        if (dto.getIdModeracion() == null) {
            throw new ResourceNotFoundException("Debe indicar el id de la moderación a actualizar.");
        }

        Optional<Moderacion> existente = mS.listId(dto.getIdModeracion());

        if (existente.isEmpty()) {
            throw new ResourceNotFoundException("No existe una moderación con el id: " + dto.getIdModeracion());
        }

        Moderacion moderacion = existente.get();
        moderacion.setTestimonio(buscarTestimonio(dto.getIdTestimonio()));
        moderacion.setUsuarioAdmin(buscarUsuario(dto.getIdUsuarioAdmin()));
        moderacion.setAccion(dto.getAccion());
        moderacion.setMotivo(dto.getMotivo());
        moderacion.setCosto(dto.getCosto());
        if (dto.getFechaAccion() != null) {
            moderacion.setFechaAccion(dto.getFechaAccion());
        }

        mS.update(moderacion);

        return ResponseEntity.ok(toDTO(moderacion));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'MUNICIPALIDAD')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Moderacion moderacion = mS.listId(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("No existe una moderación con el id: " + id)
                );

        mS.delete(moderacion.getIdModeracion());
        return ResponseEntity.noContent().build();
    }

    private Testimonio buscarTestimonio(Long idTestimonio) {
        return tS.listId(idTestimonio)
                .orElseThrow(() ->
                        new ResourceNotFoundException("No existe un testimonio con el id: " + idTestimonio)
                );
    }

    private Usuario buscarUsuario(Long idUsuario) {
        return uS.listId(idUsuario)
                .orElseThrow(() ->
                        new ResourceNotFoundException("No existe un usuario con el id: " + idUsuario)
                );
    }

    // Aviso al ciudadano cuando la municipalidad registra una accion sobre su testimonio
    private void notificarAutor(Moderacion moderacion) {
        Testimonio testimonio = moderacion.getTestimonio();
        Usuario autor = testimonio.getUsuario();
        if (autor.getIdUsuario().equals(moderacion.getUsuarioAdmin().getIdUsuario())) {
            return;
        }
        String ref = String.format("RYA-%04d", testimonio.getIdTestimonio());
        String mensaje = switch (moderacion.getAccion()) {
            case "EN_PROCESO" -> "La municipalidad está atendiendo tu reporte " + ref + ".";
            case "RESUELTO" -> "Tu reporte " + ref + " fue resuelto.";
            case "RECHAZADO" -> "Tu reporte " + ref + " fue descartado.";
            default -> "Tu reporte " + ref + " tiene una actualización.";
        };
        if (moderacion.getMotivo() != null && !moderacion.getMotivo().isBlank()) {
            mensaje += " " + moderacion.getMotivo();
        }
        nS.notificar(autor, testimonio, "ESTADO", mensaje);
    }

    private ModeracionDTO toDTO(Moderacion moderacion) {
        ModeracionDTO dto = new ModeracionDTO();
        dto.setIdModeracion(moderacion.getIdModeracion());
        dto.setIdTestimonio(moderacion.getTestimonio().getIdTestimonio());
        dto.setIdUsuarioAdmin(moderacion.getUsuarioAdmin().getIdUsuario());
        dto.setAccion(moderacion.getAccion());
        dto.setMotivo(moderacion.getMotivo());
        dto.setCosto(moderacion.getCosto());
        dto.setFechaAccion(moderacion.getFechaAccion());
        return dto;
    }
}
