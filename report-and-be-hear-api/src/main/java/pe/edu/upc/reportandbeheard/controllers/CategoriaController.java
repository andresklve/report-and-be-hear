package pe.edu.upc.reportandbeheard.controllers;

import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import pe.edu.upc.reportandbeheard.dtos.CategoriaDTO;
import pe.edu.upc.reportandbeheard.entities.Categoria;
import pe.edu.upc.reportandbeheard.exceptions.ResourceNotFoundException;
import pe.edu.upc.reportandbeheard.servicesinterfaces.ICategoriaService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/apis/categorias")
public class CategoriaController {
    private final ICategoriaService cS;
    private final ModelMapper modelMapper;

    public CategoriaController(ICategoriaService cS, ModelMapper modelMapper) {
        this.cS = cS;
        this.modelMapper = modelMapper;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'CIUDADANO', 'MUNICIPALIDAD')")
    public ResponseEntity<List<CategoriaDTO>> listar() {
        return ResponseEntity.ok(cS.list()
                .stream()
                .map(c -> modelMapper.map(c, CategoriaDTO.class))
                .toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'CIUDADANO', 'MUNICIPALIDAD')")
    public ResponseEntity<CategoriaDTO> buscarPorId(@PathVariable Long id) {
        Categoria categoria = cS.listId(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe una categoría con el id: " + id));
        return ResponseEntity.ok(modelMapper.map(categoria, CategoriaDTO.class));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<CategoriaDTO> registrar(@Valid @RequestBody CategoriaDTO dto) {
        Categoria categoria = modelMapper.map(dto, Categoria.class);
        cS.insert(categoria);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(categoria.getIdCategoria())
                .toUri();
        return ResponseEntity.created(location).body(modelMapper.map(categoria, CategoriaDTO.class));
    }

    @PutMapping
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<CategoriaDTO> actualizar(@Valid @RequestBody CategoriaDTO dto) {
        Categoria categoria = cS.listId(dto.getIdCategoria())
                .orElseThrow(() -> new ResourceNotFoundException("No existe una categoría con el id: " + dto.getIdCategoria()));
        categoria.setNombreCategoria(dto.getNombreCategoria());
        categoria.setDescripcionCategoria(dto.getDescripcionCategoria());
        categoria.setActivo(dto.getActivo());
        cS.update(categoria);
        return ResponseEntity.ok(modelMapper.map(categoria, CategoriaDTO.class));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Categoria categoria = cS.listId(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe una categoría con el id: " + id));
        cS.delete(categoria.getIdCategoria());
        return ResponseEntity.noContent().build();
    }
}