package pe.edu.upc.reportandbeheard.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.edu.upc.reportandbeheard.entities.PasswordResetToken;

import java.util.Optional;

@Repository
public interface IPasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    /** Invalida los enlaces anteriores cuando se pide uno nuevo o se cambia la contraseña. */
    @Modifying
    @Query("UPDATE PasswordResetToken p SET p.usado = true WHERE p.usuario.idUsuario = :idUsuario AND p.usado = false")
    int invalidarTodos(@Param("idUsuario") Long idUsuario);

    @Modifying
    @Query("DELETE FROM PasswordResetToken p WHERE p.usuario.idUsuario = :idUsuario")
    void eliminarPorUsuario(@Param("idUsuario") Long idUsuario);
}
