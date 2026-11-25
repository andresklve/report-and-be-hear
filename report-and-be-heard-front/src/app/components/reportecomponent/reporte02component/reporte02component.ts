import { ChangeDetectorRef, Component, OnChanges, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { TendenciaTemporalDTO } from '../../../models/ReporteDTO';
import { Reporteservice } from '../../../services/reporteservice';
import { colorReal } from '../../../shared/graficos';
type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

// US09 - Tendencia de reclamos por dia (ultimos 30 dias) o por mes
@Component({
  selector: 'app-reporte02component',
  imports: [BaseChartDirective],
  templateUrl: './reporte02component.html',
  styleUrl: './reporte02component.css',
})
export class Reporte02component implements OnChanges {

  agrupacion = input<'dia' | 'mes'>('dia')

  lista: TendenciaTemporalDTO[] = [];

  public chartType: TipoGrafico = 'line';

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
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Cantidad de reclamos en el tiempo'
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  constructor(private rS: Reporteservice, private cdr: ChangeDetectorRef) { }

  // Se vuelve a pedir cada vez que cambia la agrupacion (por dia / por mes)
  ngOnChanges(): void {
    this.obtenerTendencia();
  }

  obtenerTendencia(): void {

    this.rS.tendencia(this.agrupacion()).subscribe({

      next: (data: TendenciaTemporalDTO[]) => {

        this.lista = this.agrupacion() === 'dia' ? this.ultimos30Dias(data) : data;
        const color = colorReal('var(--chart-tendencia)', '#2F7BD6');

        this.chartData = {
          labels: this.lista.map(item => this.etiqueta(item.periodo)),
          datasets: [
            {
              label: 'Cantidad de reclamos',
              data: this.lista.map(item => item.totalTestimonios),
              borderColor: color,
              backgroundColor: color + '33',
              fill: true,
              tension: 0.3,
              borderWidth: 2
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

  // Ultimos 30 dias; los dias sin reclamos salen en 0
  private ultimos30Dias(t: TendenciaTemporalDTO[]): TendenciaTemporalDTO[] {
    const mapa = new Map(t.map(x => [x.periodo, x.totalTestimonios]))
    const fin = t.length ? new Date(t[t.length - 1].periodo + 'T00:00') : new Date()
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(fin); d.setDate(fin.getDate() - 29 + i)
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      return { periodo: k, totalTestimonios: mapa.get(k) ?? 0 }
    })
  }

  // "2026-11-05" -> "5 nov" ; "2026-11" -> "nov 26"
  private etiqueta(periodo: string) {
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic']
    const [a, m, d] = periodo.split('-')
    return d ? `${Number(d)} ${meses[Number(m) - 1]}` : `${meses[Number(m) - 1]} ${a.slice(2)}`
  }
}
