package pe.edu.upc.reportandbeheard.servicesinterfaces;

import pe.edu.upc.reportandbeheard.dtos.RankingApoyoDTO;
import pe.edu.upc.reportandbeheard.entities.Apoyo;

import java.util.List;
import java.util.Optional;

public interface IApoyoService {
    void insert(Apoyo apoyo);
    void delete(Long idApoyo);
    long contarPorTestimonio(Long idTestimonio);
    Optional<Apoyo> buscar(Long idTestimonio, Long idUsuario);
    List<RankingApoyoDTO> ranking();
}
