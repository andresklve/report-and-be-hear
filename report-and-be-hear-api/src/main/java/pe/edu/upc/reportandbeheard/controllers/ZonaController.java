package pe.edu.upc.reportandbeheard.controllers;

import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import pe.edu.upc.reportandbeheard.dtos.ZonaDTO;
import pe.edu.upc.reportandbeheard.entities.Zona;
import pe.edu.upc.reportandbeheard.exceptions.ResourceNotFoundException;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IZonaService;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/apis/zonas")
public class ZonaController {
    private final IZonaService zS;
    private final ModelMapper modelMapper;

    public ZonaController(IZonaService zS, ModelMapper modelMapper) {
        this.zS = zS;
        this.modelMapper = modelMapper;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'CIUDADANO', 'MUNICIPALIDAD')")
    public ResponseEntity<List<ZonaDTO>> listar() {
        List<ZonaDTO> lista = zS.list()
                .stream()
                .map(act -> modelMapper.map(act, ZonaDTO.class))
                .toList();

        return ResponseEntity.ok(lista);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<ZonaDTO> registrar(@Valid @RequestBody ZonaDTO dto) {
        Zona zona = modelMapper.map(dto, Zona.class);
        zS.insert(zona);

        ZonaDTO responseDTO = modelMapper.map(zona, ZonaDTO.class);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(zona.getIdZona())
                .toUri();

        return ResponseEntity
                .created(location)
                .body(responseDTO);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'CIUDADANO', 'MUNICIPALIDAD')")
    public ResponseEntity<ZonaDTO> buscarPorId(@PathVariable Long id) {
        Zona zona = zS.listId(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("No existe una zona con el id: " + id)
                );

        ZonaDTO dto = modelMapper.map(zona, ZonaDTO.class);
        return ResponseEntity.ok(dto);
    }

    @PutMapping
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<ZonaDTO> actualizar(@Valid @RequestBody ZonaDTO dto) {
        Optional<Zona> existente = zS.listId(dto.getIdZona());

        if (existente.isEmpty()) {
            throw new ResourceNotFoundException("No existe una zona con el id: " + dto.getIdZona());
        }

        Zona zona = existente.get();
        zona.setNombreZona(dto.getNombreZona());
        zona.setProvinciaZona(dto.getProvinciaZona());
        zona.setDepartamentoZona(dto.getDepartamentoZona());
        zona.setLatitudZona(dto.getLatitudZona());
        zona.setLongitudZona(dto.getLongitudZona());

        zS.update(zona);

        ZonaDTO responseDTO = modelMapper.map(zona, ZonaDTO.class);
        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Zona zona = zS.listId(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("No existe una zona con el id: " + id)
                );

        zS.delete(zona.getIdZona());
        return ResponseEntity.noContent().build();
    }
}
