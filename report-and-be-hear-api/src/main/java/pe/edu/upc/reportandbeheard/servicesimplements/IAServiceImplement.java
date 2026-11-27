package pe.edu.upc.reportandbeheard.servicesimplements;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.json.JsonParserFactory;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import pe.edu.upc.reportandbeheard.dtos.ClasificacionIADTO;
import pe.edu.upc.reportandbeheard.dtos.OpcionCategoriaDTO;
import pe.edu.upc.reportandbeheard.entities.Categoria;
import pe.edu.upc.reportandbeheard.servicesinterfaces.ICategoriaService;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IIAService;

import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Clasifica el texto de un reclamo con la API REST de Google Gemini.
 * Si no hay clave configurada o Gemini falla, se usa un respaldo por palabras clave
 * para que el ciudadano siempre pueda registrar su reclamo.
 */
@Service
public class IAServiceImplement implements IIAService {

    private static final Logger log = LoggerFactory.getLogger(IAServiceImplement.class);
    private static final String MODELO_REGLAS = "reglas";

    private final ICategoriaService cS;
    private final RestClient gemini;
    private final String apiKey;
    // Modelos en orden de preferencia: si uno esta saturado (503) o no responde, se prueba el siguiente
    private final List<String> modelos;

    public IAServiceImplement(ICategoriaService cS,
                              @Value("${gemini.api.key:}") String apiKey,
                              @Value("${gemini.models:gemini-3.5-flash-lite,gemini-flash-lite-latest,gemini-3.8-flash}") String modelos) {
        this.cS = cS;
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.modelos = java.util.Arrays.stream(modelos.split(",")).map(String::trim).filter(m -> !m.isEmpty()).toList();
        SimpleClientHttpRequestFactory fabrica = new SimpleClientHttpRequestFactory();
        fabrica.setConnectTimeout(Duration.ofSeconds(5));
        fabrica.setReadTimeout(Duration.ofSeconds(10));
        this.gemini = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .requestFactory(fabrica)
                .build();
        log.info("IA de clasificacion: {}", this.apiKey.isEmpty()
                ? "sin GEMINI_API_KEY, se usaran reglas por palabras clave"
                : "Google Gemini " + this.modelos);
    }

    @Override
    public ClasificacionIADTO clasificar(String texto) {
        List<Categoria> categorias = cS.list().stream()
                .filter(c -> Boolean.TRUE.equals(c.getActivo()))
                .toList();
        if (!apiKey.isEmpty() && !categorias.isEmpty()) {
            for (String modelo : modelos) {
                try {
                    return clasificarConGemini(texto, categorias, modelo);
                } catch (Exception e) {
                    String motivo = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
                    log.warn("Gemini {} no respondio ({})", modelo, motivo.length() > 120 ? motivo.substring(0, 120) + "..." : motivo);
                }
            }
            log.warn("Ningun modelo de Gemini respondio; se usa el respaldo por reglas");
        }
        return clasificarConReglas(texto, categorias);
    }

    // ===================== Google Gemini =====================

    @SuppressWarnings("unchecked")
    private ClasificacionIADTO clasificarConGemini(String texto, List<Categoria> categorias, String modelo) {
        String lista = categorias.stream()
                .map(c -> c.getIdCategoria() + " = " + c.getNombreCategoria()
                        + (c.getDescripcionCategoria() != null ? " (" + c.getDescripcionCategoria() + ")" : ""))
                .collect(Collectors.joining("\n"));

        String instrucciones = """
                Eres el clasificador de reclamos ciudadanos de ReclamaYA, una plataforma del Perú.
                Categorías disponibles (usa su número):
                %s

                Cada reporte debe tratar UN solo problema. Lee el reclamo y detecta si describe
                problemas DISTINTOS que pertenecen a categorías diferentes
                (por ejemplo "hay un bache y además la basura no la recogen" = 2 problemas).
                Un mismo problema contado con varios detalles es UN solo problema.

                Responde solo con el JSON pedido:
                - problemas: un elemento por cada problema distinto, del más importante al menos importante,
                  sin repetir categoría. Cada uno con:
                    - idCategoria: número de la categoría de ese problema.
                    - confianza: qué tan seguro estás de esa categoría, de 0 a 1.
                    - fragmento: frase corta (máximo 12 palabras) del reclamo que habla de ese problema.
                  Si el reclamo trata un solo problema, la lista tiene un solo elemento.
                - direccion: la dirección o referencia de lugar que aparezca en el texto
                  (por ejemplo "Av. Arequipa 1520, Lince"); cadena vacía si no hay ninguna.
                """.formatted(lista);

        Map<String, Object> esquema = Map.of(
                "type", "OBJECT",
                "properties", Map.of(
                        "problemas", Map.of(
                                "type", "ARRAY",
                                "items", Map.of(
                                        "type", "OBJECT",
                                        "properties", Map.of(
                                                "idCategoria", Map.of("type", "INTEGER"),
                                                "confianza", Map.of("type", "NUMBER"),
                                                "fragmento", Map.of("type", "STRING")),
                                        "required", List.of("idCategoria", "confianza", "fragmento"))),
                        "direccion", Map.of("type", "STRING")),
                "required", List.of("problemas", "direccion"));

        Map<String, Object> cuerpo = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", instrucciones))),
                "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", texto)))),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json",
                        "responseSchema", esquema,
                        "temperature", 0));

        Map<String, Object> respuesta = gemini.post()
                .uri("/models/{modelo}:generateContent", modelo)
                .header("x-goog-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(cuerpo)
                .retrieve()
                .body(Map.class);

        // candidates[0].content.parts[0].text contiene el JSON pedido
        List<Map<String, Object>> candidatos = (List<Map<String, Object>>) respuesta.get("candidates");
        Map<String, Object> contenido = (Map<String, Object>) candidatos.get(0).get("content");
        List<Map<String, Object>> partes = (List<Map<String, Object>>) contenido.get("parts");
        String json = (String) partes.get(0).get("text");
        Map<String, Object> datos = JsonParserFactory.getJsonParser().parseMap(json);

        // Un problema por categoria (se ignoran categorias que no existen o repetidas)
        Map<Long, OpcionCategoriaDTO> porCategoria = new LinkedHashMap<>();
        for (Map<String, Object> p : (List<Map<String, Object>>) datos.get("problemas")) {
            Long idCategoria = ((Number) p.get("idCategoria")).longValue();
            Optional<Categoria> categoria = categorias.stream()
                    .filter(c -> c.getIdCategoria().equals(idCategoria))
                    .findFirst();
            if (categoria.isEmpty() || porCategoria.containsKey(idCategoria)) continue;
            double confianza = Math.max(0, Math.min(1, ((Number) p.get("confianza")).doubleValue()));
            String fragmento = ((String) p.getOrDefault("fragmento", "")).trim();
            porCategoria.put(idCategoria, new OpcionCategoriaDTO(idCategoria, categoria.get().getNombreCategoria(),
                    redondear(confianza), fragmento.isEmpty() ? null : recortar(fragmento)));
        }
        if (porCategoria.isEmpty()) {
            throw new IllegalStateException("Gemini no devolvio ninguna categoria valida");
        }
        String direccion = ((String) datos.getOrDefault("direccion", "")).trim();

        return armarResultado(new ArrayList<>(porCategoria.values()),
                direccion.isEmpty() ? null : recortar(direccion), modelo);
    }

    // La primera opcion es la sugerencia principal; con 2 o mas, el ciudadano debe elegir una
    private ClasificacionIADTO armarResultado(List<OpcionCategoriaDTO> opciones, String direccion, String modelo) {
        OpcionCategoriaDTO principal = opciones.get(0);
        ClasificacionIADTO dto = new ClasificacionIADTO(principal.getIdCategoria(), principal.getNombreCategoria(),
                direccion, principal.getConfianza(), modelo);
        dto.setOpciones(opciones);
        dto.setVariosProblemas(opciones.size() > 1);
        return dto;
    }

    // ===================== Respaldo por palabras clave =====================

    // Palabras que suelen aparecer en cada tipo de problema (se comparan con el nombre de la categoria)
    private static final Map<Pattern, Pattern> REGLAS = Map.of(
            Pattern.compile("bache|pista|vía|via|calle"), Pattern.compile("bache|hueco|forado|pista|vereda|asfalto|pavimento"),
            Pattern.compile("alumbr|luz|poste"), Pattern.compile("poste|luminaria|foco|alumbrado|oscur|apagad|luz"),
            Pattern.compile("basura|residuo|limpie"), Pattern.compile("basura|desmonte|residuo|recolector|camión|camion|desperdicio|olor"),
            Pattern.compile("segur|robo|delinc"), Pattern.compile("robo|asalt|delincu|insegur|pandill|ladr|droga|serenazgo"),
            Pattern.compile("agua|desag|fuga"), Pattern.compile("agua|desagüe|desague|fuga|tubería|tuberia|alcantarill|aniego|buzón|buzon"));

    // Tipo de via + nombre en mayusculas (con "de", "la"...) + numero opcional + ", Distrito" opcional.
    // Ej.: "Av. Arequipa 1520, Lince" o "Calle Las Flores"
    private static final Pattern DIRECCION = Pattern.compile(
            "((?i:Av\\.?|Avenida|Jr\\.?|Jirón|Jiron|Calle|Ca\\.|Psje\\.?|Pasaje|Mz\\.?|Urb\\.?|Prolongación|Prolongacion|Carretera)"
                    + "(?:\\s+(?:\\p{Lu}[\\p{L}.'-]*|de|del|la|las|los|el|\\d{1,5}))+"
                    + "(?:,\\s*\\p{Lu}[\\p{L}]+(?:\\s+\\p{Lu}[\\p{L}]+)*)?)");

    private ClasificacionIADTO clasificarConReglas(String texto, List<Categoria> categorias) {
        String t = texto.toLowerCase();
        // Coincidencias de palabras clave por categoria
        Map<Categoria, Integer> conteo = new LinkedHashMap<>();
        for (Categoria c : categorias) {
            String nombre = c.getNombreCategoria().toLowerCase();
            for (Map.Entry<Pattern, Pattern> r : REGLAS.entrySet()) {
                if (!r.getKey().matcher(nombre).find()) continue;
                Matcher m = r.getValue().matcher(t);
                int coincidencias = 0;
                while (m.find()) coincidencias++;
                if (coincidencias > conteo.getOrDefault(c, 0)) conteo.put(c, coincidencias);
            }
        }
        List<Map.Entry<Categoria, Integer>> encontradas = conteo.entrySet().stream()
                .filter(e -> e.getValue() > 0)
                .sorted((a, b) -> b.getValue() - a.getValue())
                .toList();
        Optional<String> direccion = Optional.empty();
        Matcher d = DIRECCION.matcher(texto);
        if (d.find()) direccion = Optional.of(recortar(d.group(1).trim()));

        if (encontradas.isEmpty()) {
            // Sin coincidencias: "Otros" si existe; si no, sin categoria sugerida
            Optional<Categoria> otros = categorias.stream()
                    .filter(c -> c.getNombreCategoria().toLowerCase().startsWith("otro"))
                    .findFirst();
            return new ClasificacionIADTO(otros.map(Categoria::getIdCategoria).orElse(null),
                    otros.map(Categoria::getNombreCategoria).orElse(null),
                    direccion.orElse(null), 0.2, MODELO_REGLAS);
        }
        List<OpcionCategoriaDTO> opciones = encontradas.stream()
                .map(e -> new OpcionCategoriaDTO(e.getKey().getIdCategoria(), e.getKey().getNombreCategoria(),
                        redondear(Math.min(0.8, 0.4 + 0.15 * (e.getValue() - 1))), null))
                .toList();
        return armarResultado(opciones, direccion.orElse(null), MODELO_REGLAS);
    }

    private static String recortar(String s) {
        return s.length() > 255 ? s.substring(0, 255) : s;
    }

    private static double redondear(double v) {
        return Math.round(v * 100) / 100.0;
    }
}
