import { ChangeDetectorRef, Component, effect, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Resultadosservice } from '../../../services/resultadosservice';
import { colorReal } from '../../../shared/graficos';
type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

// /cifras/inversion (porcentajes, sin montos)
@Component({
  selector: 'app-resultadosinversioncomponent',
  imports: [MatCardModule, MatButtonModule, BaseChartDirective],
  templateUrl: './resultadosinversioncomponent.html',
  styleUrl: './resultadosinversioncomponent.css',
})
export class Resultadosinversioncomponent {
  r = inject(Resultadosservice)

  public chartType: TipoGrafico = 'bar';

  public chartData: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [
      {
        label: '% de la inversión nacional',
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
        text: 'Participación de cada departamento en la inversión (%)'
      },
      tooltip: {
        callbacks: { label: ctx => ' ' + this.r.porcentaje(Number(ctx.raw)) }
      }
    },
    scales: {
      x: { ticks: { autoSkip: false, maxRotation: 60, minRotation: 45 } },
      y: { beginAtZero: true, ticks: { callback: v => v + '%' } }
    }
  };

  constructor(private cdr: ChangeDetectorRef) {
    // Se vuelve a armar cada vez que cambia el departamento elegido (va en rojo)
    effect(() => this.obtenerInversion());
  }

  obtenerInversion(): void {

    const data = this.r.barrasInversion();

    this.chartData = {
      labels: data.map(item => item.label),
      datasets: [
        {
          label: '% de la inversión nacional',
          data: data.map(item => item.valor),
          backgroundColor: data.map(item => colorReal(item.color)),
          borderWidth: 1
        }
      ]
    };
    this.cdr.detectChanges()
  }
}
