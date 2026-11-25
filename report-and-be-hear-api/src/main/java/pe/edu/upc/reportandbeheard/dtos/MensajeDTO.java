package pe.edu.upc.reportandbeheard.dtos;

import io.swagger.v3.oas.annotations.media.Schema;

public record MensajeDTO(@Schema(example = "Operación realizada correctamente.") String mensaje) {
}
