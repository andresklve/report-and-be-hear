import { ChangeDetectorRef, Component, effect, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Resultadosservice } from '../../../services/resultadosservice';
import { colorReal } from '../../../shared/graficos';
type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

// /cifras/avance-de-atencion
@Component({
  selector: 'app-resultadosavancecomponent',
  imports: [MatCardModule, BaseChartDirective],
  templateUrl: './resultadosavancecomponent.html',
  styleUrl: './resultadosavancecomponent.css',
})
export class Resultadosavancecomponent {
  r = inject(Resultadosservice)

  // ----- Grafico 1: reclamos por estado -----
  public chartTypeEstados: TipoGrafico = 'doughnut';

  public chartDataEstados: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [
      {
        label: 'Cantidad de reclamos',
        data: [],
        borderWidth: 1
      }
    ]
  };

  public chartOptionsEstados: ChartOptions = {
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

  // ----- Grafico 2: % resuelto por tipo de problema -----
  public chartTypeResueltos: TipoGrafico = 'bar';

  public chartDataResueltos: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [
      {
        label: '% resuelto',
        data: [],
        borderWidth: 1
      }
    ]
  };

  public chartOptionsResueltos: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Porcentaje resuelto por tipo de problema'
      },
      tooltip: {
        callbacks: { label: ctx => ' ' + ctx.raw + '%' }
      }
    },
    scales: {
      x: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } }
    }
  };

  constructor(private cdr: ChangeDetectorRef) {
    // Se vuelven a armar cada vez que cambia el departamento elegido
    effect(() => this.obtenerEstados());
    effect(() => this.obtenerResueltos());
  }

  obtenerEstados(): void {

    const data = this.r.donaEstados();

    this.chartDataEstados = {
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

  obtenerResueltos(): void {

    const data = this.r.barrasResueltas();

    this.chartDataResueltos = {
      labels: data.map(item => item.label),
      datasets: [
        {
          label: '% resuelto',
          data: data.map(item => item.valor),
          backgroundColor: data.map(item => colorReal(item.color)),
          borderWidth: 1
        }
      ]
    };
    this.cdr.detectChanges()
  }
}
