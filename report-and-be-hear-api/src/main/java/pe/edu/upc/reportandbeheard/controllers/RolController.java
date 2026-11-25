package pe.edu.upc.reportandbeheard.controllers;

import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import pe.edu.upc.reportandbeheard.dtos.RolDTO;
import pe.edu.upc.reportandbeheard.entities.Rol;
import pe.edu.upc.reportandbeheard.exceptions.ResourceNotFoundException;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IRolService;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/apis/roles")
public class RolController {
    private final IRolService rS;
    private final ModelMapper modelMapper;

    public RolController(IRolService rS, ModelMapper modelMapper) {
        this.rS = rS;
        this.modelMapper = modelMapper;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<List<RolDTO>> listar() {
        List<RolDTO> lista = rS.list()
                .stream()
                .map(act -> modelMapper.map(act, RolDTO.class))
                .toList();

        return ResponseEntity.ok(lista);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<RolDTO> registrar(@Valid @RequestBody RolDTO dto) {
        Rol rol = modelMapper.map(dto, Rol.class);
        rS.insert(rol);

        RolDTO responseDTO = modelMapper.map(rol, RolDTO.class);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(rol.getIdRol())
                .toUri();

        return ResponseEntity
                .created(location)
                .body(responseDTO);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<RolDTO> buscarPorId(@PathVariable Long id) {
        Rol rol = rS.listId(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("No existe un rol con el id: " + id)
                );

        RolDTO dto = modelMapper.map(rol, RolDTO.class);
        return ResponseEntity.ok(dto);
    }

    @PutMapping
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<RolDTO> actualizar(@Valid @RequestBody RolDTO dto) {
        Optional<Rol> existente = rS.listId(dto.getIdRol());

        if (existente.isEmpty()) {
            throw new ResourceNotFoundException("No existe un rol con el id: " + dto.getIdRol());
        }

        Rol rol = existente.get();
        rol.setNombreRol(dto.getNombreRol());
        rol.setDescripcionRol(dto.getDescripcionRol());

        rS.update(rol);

        RolDTO responseDTO = modelMapper.map(rol, RolDTO.class);
        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Rol rol = rS.listId(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("No existe un rol con el id: " + id)
                );

        rS.delete(rol.getIdRol());
        return ResponseEntity.noContent().build();
    }
}
