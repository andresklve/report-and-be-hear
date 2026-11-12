package pe.edu.upc.reportandbeheard.servicesimplements;

import org.springframework.stereotype.Service;
import pe.edu.upc.reportandbeheard.dtos.RankingApoyoDTO;
import pe.edu.upc.reportandbeheard.entities.Apoyo;
import pe.edu.upc.reportandbeheard.repositories.IApoyoRepository;
import pe.edu.upc.reportandbeheard.servicesinterfaces.IApoyoService;

import java.util.List;
import java.util.Optional;

@Service
public class ApoyoServiceImplement implements IApoyoService {
    private final IApoyoRepository aR;

    public ApoyoServiceImplement(IApoyoRepository aR) {
        this.aR = aR;
    }

    @Override
    public void insert(Apoyo apoyo) {
        aR.save(apoyo);
    }

    @Override
    public void delete(Long idApoyo) {
        aR.deleteById(idApoyo);
    }

    @Override
    public long contarPorTestimonio(Long idTestimonio) {
        return aR.countByTestimonio_IdTestimonio(idTestimonio);
    }

    @Override
    public Optional<Apoyo> buscar(Long idTestimonio, Long idUsuario) {
        return aR.findByTestimonio_IdTestimonioAndUsuario_IdUsuario(idTestimonio, idUsuario);
    }

    @Override
    public List<RankingApoyoDTO> ranking() {
        return aR.rankingApoyos();
    }
}
