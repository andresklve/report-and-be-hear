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

    public ModeracionController(IModeracionService mS, ITestimonioService tS, IUsuarioService uS) {
        this.mS = mS;
        this.tS = tS;
        this.uS = uS;
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
