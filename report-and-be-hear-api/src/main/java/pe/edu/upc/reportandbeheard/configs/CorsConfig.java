package pe.edu.upc.reportandbeheard.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Configuration
public class CorsConfig {

    // Origenes permitidos separados por coma (variable CORS_ORIGINS); por defecto los de desarrollo
    @Value("${app.cors.origins:http://localhost:4200,http://localhost:4201}")
    private String origenes;

    // La URL del frontend (FRONT_URL, la de Netlify en produccion) siempre se permite
    @Value("${app.front.url:http://localhost:4200}")
    private String frontUrl;

    // Configuracion global de CORS para el frontend Angular
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        Set<String> permitidos = new LinkedHashSet<>();
        Arrays.stream(origenes.split(","))
                .map(String::trim)
                .filter(o -> !o.isEmpty())
                .forEach(permitidos::add);
        permitidos.add(sinBarraFinal(frontUrl.trim()));
        configuration.setAllowedOrigins(
                permitidos.stream().map(this::sinBarraFinal).toList()
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET", "POST", "PUT",
                        "DELETE", "PATCH", "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept"
                )
        );

        configuration.setExposedHeaders(
                List.of("Authorization")
        );

        // Para JWT enviado en la cabecera Authorization
        configuration.setAllowCredentials(false);

        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    // El navegador envia el origen sin "/" final (https://app.netlify.app)
    private String sinBarraFinal(String url) {
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
