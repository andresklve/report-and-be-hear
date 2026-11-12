package pe.edu.upc.reportandbeheard.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.edu.upc.reportandbeheard.dtos.NotificacionDTO;
import pe.edu.upc.reportandbeheard.entities.Notificacion;
import pe.edu.upc.reportandbeheard.exceptions.ResourceNotFoundException;
import pe.edu.upc.reportandbeheard.servicesinterfaces.INotificacionService;

import java.util.List;

@RestController
@RequestMapping("/apis/notificaciones")
public class NotificacionController {
    private final INotificacionService nS;

    public NotificacionController(INotificacionService nS) {
        this.nS = nS;
    }

    @Operation(summary = "Notificaciones de un usuario", description = "De la más reciente a la más antigua.")
    @GetMapping("/usuario/{idUsuario}")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'CIUDADANO', 'MUNICIPALIDAD')")
    public ResponseEntity<List<NotificacionDTO>> listarPorUsuario(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(nS.listPorUsuario(idUsuario).stream().map(this::toDTO).toList());
    }

    @Operation(summary = "Marcar una notificación como leída")
    @PutMapping("/{id}/leida")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'CIUDADANO', 'MUNICIPALIDAD')")
    public ResponseEntity<NotificacionDTO> marcarLeida(@PathVariable Long id) {
        Notificacion notificacion = nS.listId(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe una notificación con el id: " + id));
        notificacion.setLeida(true);
        nS.update(notificacion);
        return ResponseEntity.ok(toDTO(notificacion));
    }

    @Operation(summary = "Marcar todas las notificaciones del usuario como leídas")
    @PutMapping("/usuario/{idUsuario}/leidas")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'CIUDADANO', 'MUNICIPALIDAD')")
    public ResponseEntity<Void> marcarTodasLeidas(@PathVariable Long idUsuario) {
        nS.listPorUsuario(idUsuario).stream()
                .filter(n -> !Boolean.TRUE.equals(n.getLeida()))
                .forEach(n -> {
                    n.setLeida(true);
                    nS.update(n);
                });
        return ResponseEntity.noContent().build();
    }

    private NotificacionDTO toDTO(Notificacion notificacion) {
        NotificacionDTO dto = new NotificacionDTO();
        dto.setIdNotificacion(notificacion.getIdNotificacion());
        dto.setIdUsuario(notificacion.getUsuario().getIdUsuario());
        if (notificacion.getTestimonio() != null) {
            dto.setIdTestimonio(notificacion.getTestimonio().getIdTestimonio());
        }
        dto.setTipo(notificacion.getTipo());
        dto.setMensaje(notificacion.getMensaje());
        dto.setLeida(notificacion.getLeida());
        dto.setFechaCreacion(notificacion.getFechaCreacion());
        return dto;
    }
}
