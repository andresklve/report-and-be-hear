package pe.edu.upc.reportandbeheard.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import pe.edu.upc.reportandbeheard.dtos.ComentarioDTO;
import pe.edu.upc.reportandbeheard.entities.Comentario;
import pe.edu.upc.reportandbeheard.entities.Testimonio;
import pe.edu.upc.reportandbeheard.entities.Usuario;
import pe.edu.upc.reportandbeheard.exceptions.ResourceNotFoundException;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IComentarioService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.INotificacionService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.ISuspensionService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.ITestimonioService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IUsuarioService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/apis/comentarios")
public class ComentarioController {
    private final IComentarioService cS;
    private final ITestimonioService tS;
    private final IUsuarioService uS;
    private final ISuspensionService sS;
    private final INotificacionService nS;

    public ComentarioController(IComentarioService cS, ITestimonioService tS, IUsuarioService uS,
                                ISuspensionService sS, INotificacionService nS) {
        this.cS = cS;
        this.tS = tS;
        this.uS = uS;
        this.sS = sS;
        this.nS = nS;
    }

    @Operation(summary = "Listar comentarios", description = "Con idTestimonio devuelve los comentarios de ese testimonio (del más antiguo al más reciente); sin él, todos.")
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'CIUDADANO', 'MUNICIPALIDAD')")
    public ResponseEntity<List<ComentarioDTO>> listar(@RequestParam(required = false) Long idTestimonio) {
        List<Comentario> lista = idTestimonio == null ? cS.list() : cS.listPorTestimonio(idTestimonio);
        return ResponseEntity.ok(lista.stream().map(this::toDTO).toList());
    }

    @Operation(summary = "Comentar un testimonio", description = "Registra un comentario. Las cuentas suspendidas no pueden comentar.")
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'CIUDADANO', 'MUNICIPALIDAD')")
    public ResponseEntity<ComentarioDTO> registrar(@Valid @RequestBody ComentarioDTO dto) {
        Testimonio testimonio = buscarTestimonio(dto.getIdTestimonio());
        Usuario usuario = buscarUsuario(dto.getIdUsuario());
        sS.validarNoSuspendido(usuario.getIdUsuario());

        Comentario comentario = new Comentario();
        comentario.setTestimonio(testimonio);
        comentario.setUsuario(usuario);
        comentario.setTexto(dto.getTexto().trim());
        cS.insert(comentario);

        // Aviso al autor del testimonio (si no es el mismo que comenta)
        Usuario autor = testimonio.getUsuario();
        if (!autor.getIdUsuario().equals(usuario.getIdUsuario())) {
            nS.notificar(autor, testimonio, "COMENTARIO",
                    usuario.getNombres() + " comentó tu reporte " + referencia(testimonio) + ".");
        }

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(comentario.getIdComentario())
                .toUri();
        return ResponseEntity.created(location).body(toDTO(comentario));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'CIUDADANO', 'MUNICIPALIDAD')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Comentario comentario = cS.listId(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un comentario con el id: " + id));
        cS.delete(comentario.getIdComentario());
        return ResponseEntity.noContent().build();
    }

    private Testimonio buscarTestimonio(Long idTestimonio) {
        return tS.listId(idTestimonio)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un testimonio con el id: " + idTestimonio));
    }

    private Usuario buscarUsuario(Long idUsuario) {
        return uS.listId(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un usuario con el id: " + idUsuario));
    }

    private String referencia(Testimonio t) {
        return String.format("RYA-%04d", t.getIdTestimonio());
    }

    private ComentarioDTO toDTO(Comentario comentario) {
        ComentarioDTO dto = new ComentarioDTO();
        dto.setIdComentario(comentario.getIdComentario());
        dto.setIdTestimonio(comentario.getTestimonio().getIdTestimonio());
        dto.setIdUsuario(comentario.getUsuario().getIdUsuario());
        dto.setTexto(comentario.getTexto());
        dto.setFechaCreacion(comentario.getFechaCreacion());
        Usuario u = comentario.getUsuario();
        String inicial = u.getApellidos() == null || u.getApellidos().isBlank() ? "" : " " + u.getApellidos().charAt(0) + ".";
        dto.setNombreAutor(u.getNombres() + inicial);
        return dto;
    }
}
