import { ChangeDetectorRef, Component, effect, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Resultadosservice } from '../../../services/resultadosservice';
import { colorReal } from '../../../shared/graficos';
type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

// /cifras/tipos-de-problema
@Component({
  selector: 'app-resultadostiposcomponent',
  imports: [MatCardModule, BaseChartDirective],
  templateUrl: './resultadostiposcomponent.html',
  styleUrl: './resultadostiposcomponent.css',
})
export class Resultadostiposcomponent {
  r = inject(Resultadosservice)

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
        text: 'Cantidad de reclamos por tipo de problema'
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  constructor(private cdr: ChangeDetectorRef) {
    // Se vuelve a armar cada vez que cambia el departamento elegido
    effect(() => this.obtenerCantidad());
  }

  obtenerCantidad(): void {

    const data = this.r.columnasCategorias();

    this.chartData = {
      labels: data.map(item => item.label),
      datasets: [
        {
          label: 'Cantidad de reclamos',
          data: data.map(item => item.valor),
          backgroundColor: data.map(item => colorReal(item.color)),
          borderWidth: 1
        }
      ]
    };
    this.cdr.detectChanges()
  }
}
