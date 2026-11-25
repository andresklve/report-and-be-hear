import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { TestimonioDTO } from '../../../models/TestimonioDTO';
import { Testimonioservice } from '../../../services/testimonioservice';
import { ESTADOS, colorEstado } from '../../../shared/ui';
import { colorReal } from '../../../shared/graficos';
type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

// Cantidad de reclamos por estado de atencion
@Component({
  selector: 'app-reporte06component',
  imports: [BaseChartDirective],
  templateUrl: './reporte06component.html',
  styleUrl: './reporte06component.css',
})
export class Reporte06component implements OnInit {

  lista: TestimonioDTO[] = [];

  public chartType: TipoGrafico = 'doughnut';

  public chartData: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [
      {
        label: 'Cantidad de reclamos por estado',
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
        position: 'right'
      },
      title: {
        display: true,
        text: 'Cantidad de reclamos por estado'
      }
    }
  };

  constructor(private tS: Testimonioservice, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.obtenerEstados();
  }

  obtenerEstados(): void {

    this.tS.list().subscribe({

      next: (data: TestimonioDTO[]) => {

        this.lista = data;

        this.chartData = {
          labels: ESTADOS.map(e => e.label),
          datasets: [
            {
              label: 'Cantidad de reclamos',
              data: ESTADOS.map(e => data.filter(t => t.estado === e.key).length),
              backgroundColor: ESTADOS.map(e => colorReal(colorEstado(e.key))),
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
