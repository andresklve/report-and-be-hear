import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { RankingZonaDTO } from '../../../models/ReporteDTO';
import { Reporteservice } from '../../../services/reporteservice';
import { colorReal } from '../../../shared/graficos';
type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

// US10 - Zonas con mas reclamos (top 6)
@Component({
  selector: 'app-reporte05component',
  imports: [BaseChartDirective],
  templateUrl: './reporte05component.html',
  styleUrl: './reporte05component.css',
})
export class Reporte05component implements OnInit {

  lista: RankingZonaDTO[] = [];

  public chartType: TipoGrafico = 'bar';

  public chartData: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [
      {
        label: 'Cantidad de reclamos',
        data: [],
        borderWidth: 1
      }
    ]
  };

  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Zonas con más reclamos'
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  constructor(private rS: Reporteservice, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.obtenerRanking();
  }

  obtenerRanking(): void {

    this.rS.rankingZonas().subscribe({

      next: (data: RankingZonaDTO[]) => {

        this.lista = data.slice(0, 6);

        this.chartData = {
          labels: this.lista.map(item => item.nombreZona),
          datasets: [
            {
              label: 'Cantidad de reclamos',
              data: this.lista.map(item => item.totalTestimonios),
              backgroundColor: colorReal('var(--chart-ranking)', '#41474F'),
              borderWidth: 1
            }
          ]
        };
        this.cdr.detectChanges()
      },

      error: (error) => {
        console.error('Error al cargar!!!', error);
      }

    });
  }
}
