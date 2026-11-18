package pe.edu.upc.reportandbeheard.servicesimplements;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import pe.edu.upc.reportandbeheard.entities.Usuario;
import pe.edu.upc.reportandbeheard.repositories.IUsuarioRepository;
import pe.edu.upc.reportandbeheard.servicesinterfaces.ISuspensionService;

import java.util.List;

@Service
public class JwtUserDetailsService implements UserDetailsService {

    private final IUsuarioRepository usuarioRepository;
    private final ISuspensionService suspensionService;

    public JwtUserDetailsService(IUsuarioRepository usuarioRepository, ISuspensionService suspensionService) {
        this.usuarioRepository = usuarioRepository;
        this.suspensionService = suspensionService;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Usuario no encontrado: " + username
                        )
                );

        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority(usuario.getRol().getNombreRol())
        );

        return User.builder()
                .username(usuario.getUsername())
                .password(usuario.getPasswordHash())
                .authorities(authorities)
                .disabled(!Boolean.TRUE.equals(usuario.getActivo()))
                .accountLocked(suspensionService.vigente(usuario.getIdUsuario()).isPresent())
                .build();
    }
}
