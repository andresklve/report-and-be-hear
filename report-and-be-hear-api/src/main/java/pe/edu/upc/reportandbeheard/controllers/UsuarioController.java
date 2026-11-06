package pe.edu.upc.reportandbeheard.controllers;

import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import pe.edu.upc.reportandbeheard.dtos.UsuarioDTO;
import pe.edu.upc.reportandbeheard.entities.Rol;
import pe.edu.upc.reportandbeheard.entities.Usuario;
import pe.edu.upc.reportandbeheard.exceptions.ResourceNotFoundException;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IRolService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IUsuarioService;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/apis/usuarios")
public class UsuarioController {
    private final IUsuarioService uS;
    private final IRolService rS;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(IUsuarioService uS, IRolService rS, ModelMapper modelMapper,
                             PasswordEncoder passwordEncoder) {
        this.uS = uS;
        this.rS = rS;
        this.modelMapper = modelMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<List<UsuarioDTO>> listar() {
        List<UsuarioDTO> lista = uS.list()
                .stream()
                .map(u -> {
                    UsuarioDTO dto = modelMapper.map(u, UsuarioDTO.class);
                    dto.setIdRol(u.getRol().getIdRol());
                    dto.setPasswordHash(null);
                    return dto;
                })
                .toList();

        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<UsuarioDTO> registrar(@Valid @RequestBody UsuarioDTO dto) {
        // El registro es publico: solo un ADMINISTRADOR autenticado elige rol y estado,
        // para cualquier otro caso el rol es CIUDADANO, activo es true e idRol se ignora.
        boolean esAdmin = esAdministrador();
        Rol rol;
        if (esAdmin && dto.getIdRol() != null) {
            rol = rS.listId(dto.getIdRol())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("No existe un rol con el id: " + dto.getIdRol())
                    );
        } else {
            rol = rS.list()
                    .stream()
                    .filter(r -> "CIUDADANO".equals(r.getNombreRol()))
                    .findFirst()
                    .orElseThrow(() ->
                            new ResourceNotFoundException("No existe el rol CIUDADANO en la base de datos")
                    );
        }

        Usuario usuario = modelMapper.map(dto, Usuario.class);
        usuario.setIdUsuario(null); // un registro siempre crea; nunca pisa un usuario existente
        usuario.setRol(rol);
        usuario.setActivo(esAdmin && dto.getActivo() != null ? dto.getActivo() : Boolean.TRUE);
        usuario.setPasswordHash(passwordEncoder.encode(dto.getPasswordHash()));
        usuario.setFechaRegistro(LocalDateTime.now());

        uS.insert(usuario);

        UsuarioDTO responseDTO = modelMapper.map(usuario, UsuarioDTO.class);
        responseDTO.setIdRol(usuario.getRol().getIdRol());
        responseDTO.setPasswordHash(null);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(usuario.getIdUsuario())
                .toUri();

        return ResponseEntity
                .created(location)
                .body(responseDTO);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<UsuarioDTO> buscarPorId(@PathVariable Long id) {
        Usuario usuario = uS.listId(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("No existe un usuario con el id: " + id)
                );

        UsuarioDTO dto = modelMapper.map(usuario, UsuarioDTO.class);
        dto.setIdRol(usuario.getRol().getIdRol());
        dto.setPasswordHash(null);
        return ResponseEntity.ok(dto);
    }

    @PutMapping
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<UsuarioDTO> actualizar(@Valid @RequestBody UsuarioDTO dto) {
        Usuario existente = uS.listId(dto.getIdUsuario())
                .orElseThrow(() ->
                        new ResourceNotFoundException("No existe un usuario con el id: " + dto.getIdUsuario())
                );

        if (dto.getIdRol() != null) {
            Rol rol = rS.listId(dto.getIdRol())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("No existe un rol con el id: " + dto.getIdRol())
                    );
            existente.setRol(rol);
        }
        existente.setNombres(dto.getNombres());
        existente.setApellidos(dto.getApellidos());
        existente.setCorreo(dto.getCorreo());
        String nuevaPassword = dto.getPasswordHash();
        if (nuevaPassword == null || nuevaPassword.isBlank()) {
            // sin contrasena nueva: se conserva el hash que ya tiene el usuario
        } else if (esHashBCrypt(nuevaPassword)) {
            existente.setPasswordHash(nuevaPassword);
        } else {
            existente.setPasswordHash(passwordEncoder.encode(nuevaPassword));
        }
        if (dto.getActivo() != null) {
            existente.setActivo(dto.getActivo());
        }

        uS.update(existente);

        UsuarioDTO responseDTO = modelMapper.map(existente, UsuarioDTO.class);
        responseDTO.setIdRol(existente.getRol().getIdRol());
        responseDTO.setPasswordHash(null);
        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Usuario usuario = uS.listId(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("No existe un usuario con el id: " + id)
                );

        uS.delete(usuario.getIdUsuario());
        return ResponseEntity.noContent().build();
    }

    private boolean esHashBCrypt(String valor) {
        return valor.startsWith("$2a$") || valor.startsWith("$2b$") || valor.startsWith("$2y$");
    }

    private boolean esAdministrador() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities()
                .stream()
                .anyMatch(a -> "ADMINISTRADOR".equals(a.getAuthority()));
    }
}