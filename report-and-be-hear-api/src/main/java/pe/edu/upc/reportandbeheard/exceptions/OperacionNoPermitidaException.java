package pe.edu.upc.reportandbeheard.exceptions;

// Regla de negocio que impide la operacion (p. ej. cuenta suspendida, apoyar el propio testimonio)
public class OperacionNoPermitidaException extends RuntimeException {
    public OperacionNoPermitidaException(String message) {
        super(message);
    }
}
