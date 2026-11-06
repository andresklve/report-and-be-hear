package pe.edu.upc.reportandbeheard.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import pe.edu.upc.reportandbeheard.dtos.TestimonioDTO;
import pe.edu.upc.reportandbeheard.dtos.TestimonioResponseDTO;
import pe.edu.upc.reportandbeheard.dtos.TestimonioUpdateRequest;
import pe.edu.upc.reportandbeheard.entities.Categoria;
import pe.edu.upc.reportandbeheard.entities.Testimonio;
import pe.edu.upc.reportandbeheard.entities.Usuario;
import pe.edu.upc.reportandbeheard.entities.Zona;
import pe.edu.upc.reportandbeheard.exceptions.ResourceNotFoundException;
import pe.edu.upc.reportandbeheard.servicesinterfaces.ICategoriaService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.ITestimonioService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IUsuarioService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IZonaService;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/apis/testimonios")
public class TestimonioController {
    private final ITestimonioService tS;
    private final IUsuarioService uS;
    private final ICategoriaService cS;
    private final IZonaService zS;
    private final ModelMapper modelMapper;

    public TestimonioController(ITestimonioService tS, IUsuarioService uS,
                               ICategoriaService cS, IZonaService zS, ModelMapper modelMapper) {
        this.tS = tS;
        this.uS = uS;
        this.cS = cS;
        this.zS = zS;
        this.modelMapper = modelMapper;
    }

    @Operation(summary = "Registrar un testimonio", description = "Crea un nuevo testimonio para un usuario, categoría y zona específicos.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Testimonio creado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TestimonioDTO.class))),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "404", description = "Usuario, categoría o zona no encontrados")
    })
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'CIUDADANO')")
    public ResponseEntity<TestimonioDTO> registrar(@Valid @RequestBody TestimonioDTO dto) {
        Usuario usuario = uS.listId(dto.getIdUsuario())
                .orElseThrow(() -> new ResourceNotFoundException("No existe un usuario con el id: " + dto.getIdUsuario()));
        Categoria categoria = cS.listId(dto.getIdCategoria())
                .orElseThrow(() -> new ResourceNotFoundException("No existe una categoría con el id: " + dto.getIdCategoria()));
        Zona zona = zS.listId(dto.getIdZona())
                .orElseThrow(() -> new ResourceNotFoundException("No existe una zona con el id: " + dto.getIdZona()));

        Testimonio testimonio = new Testimonio();
        testimonio.setUsuario(usuario);
        testimonio.setCategoria(categoria);
        testimonio.setZona(zona);
        testimonio.setDescripcionTexto(dto.getDescripcionTexto());
        testimonio.setFotoUrl(dto.getFotoUrl());
        testimonio.setDireccionTextoExtraida(dto.getDireccionTextoExtraida());
        testimonio.setLatitud(dto.getLatitud());
        testimonio.setLongitud(dto.getLongitud());
        testimonio.setEstado(dto.getEstado());
        testimonio.setConfianzaIA(dto.getConfianzaIA());
        testimonio.setModeloIA(dto.getModeloIA());
        testimonio.setFechaCreacion(LocalDateTime.now());

        tS.insert(testimonio);

        TestimonioDTO response = modelMapper.map(testimonio, TestimonioDTO.class);
        response.setIdUsuario(usuario.getIdUsuario());
        response.setIdCategoria(categoria.getIdCategoria());
        response.setIdZona(zona.getIdZona());

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(testimonio.getIdTestimonio())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @Operation(summary = "Listar testimonios", description = "Retorna la lista de testimonios registrados.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TestimonioResponseDTO.class)))
    })
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'CIUDADANO', 'MUNICIPALIDAD')")
    public ResponseEntity<List<TestimonioResponseDTO>> listar() {
        List<TestimonioResponseDTO> lista = tS.list()
                .stream()
                .map(item -> {
                    TestimonioResponseDTO dto = modelMapper.map(item, TestimonioResponseDTO.class);
                    if (item.getUsuario() != null) dto.setIdUsuario(item.getUsuario().getIdUsuario());
                    if (item.getCategoria() != null) dto.setIdCategoria(item.getCategoria().getIdCategoria());
                    if (item.getZona() != null) dto.setIdZona(item.getZona().getIdZona());
                    return dto;
                })
                .toList();

        return ResponseEntity.ok(lista);
    }

    @Operation(summary = "Buscar testimonio por ID", description = "Devuelve un testimonio según su identificador.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Testimonio encontrado", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TestimonioResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Testimonio no encontrado")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMINISTRADOR', 'CIUDADANO', 'MUNICIPALIDAD')")
    public ResponseEntity<TestimonioResponseDTO> buscarPorId(
            @Parameter(description = "Identificador del testimonio", required = true)
            @PathVariable Long id) {
        Testimonio testimonio = tS.listId(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un testimonio con el id: " + id));

        TestimonioResponseDTO dto = modelMapper.map(testimonio, TestimonioResponseDTO.class);
        dto.setIdUsuario(testimonio.getUsuario().getIdUsuario());
        dto.setIdCategoria(testimonio.getCategoria().getIdCategoria());
        dto.setIdZona(testimonio.getZona().getIdZona());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<TestimonioResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody TestimonioUpdateRequest dto) {
        Testimonio testimonio = tS.listId(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un testimonio con el id: " + id));
        Usuario usuario = uS.listId(dto.getIdUsuario())
                .orElseThrow(() -> new ResourceNotFoundException("No existe un usuario con el id: " + dto.getIdUsuario()));
        Categoria categoria = cS.listId(dto.getIdCategoria())
                .orElseThrow(() -> new ResourceNotFoundException("No existe una categoría con el id: " + dto.getIdCategoria()));
        Zona zona = zS.listId(dto.getIdZona())
                .orElseThrow(() -> new ResourceNotFoundException("No existe una zona con el id: " + dto.getIdZona()));

        testimonio.setUsuario(usuario);
        testimonio.setCategoria(categoria);
        testimonio.setZona(zona);
        testimonio.setDescripcionTexto(dto.getDescripcionTexto());
        testimonio.setFotoUrl(dto.getFotoUrl());
        testimonio.setDireccionTextoExtraida(dto.getDireccionTextoExtraida());
        testimonio.setLatitud(dto.getLatitud());
        testimonio.setLongitud(dto.getLongitud());
        testimonio.setEstado(dto.getEstado());
        testimonio.setConfianzaIA(dto.getConfianzaIA());
        testimonio.setModeloIA(dto.getModeloIA());
        testimonio.setFechaActualizacion(LocalDateTime.now());

        tS.update(testimonio);

        TestimonioResponseDTO response = modelMapper.map(testimonio, TestimonioResponseDTO.class);
        response.setIdUsuario(usuario.getIdUsuario());
        response.setIdCategoria(categoria.getIdCategoria());
        response.setIdZona(zona.getIdZona());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Testimonio testimonio = tS.listId(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un testimonio con el id: " + id));
        tS.delete(testimonio.getIdTestimonio());
        return ResponseEntity.noContent().build();
    }
}
