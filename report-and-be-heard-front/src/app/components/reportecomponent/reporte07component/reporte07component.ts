import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Reporteservice } from '../../../services/reporteservice';
import { Datosservice } from '../../../services/datosservice';
import { colorCategoria, soles } from '../../../shared/ui';
import { colorReal } from '../../../shared/graficos';
type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

// US12 - Costo promedio por reclamo atendido
// costo total de la categoria / reclamos de esa categoria en atencion o resueltos
@Component({
  selector: 'app-reporte07component',
  imports: [BaseChartDirective],
  templateUrl: './reporte07component.html',
  styleUrl: './reporte07component.css',
})
export class Reporte07component implements OnInit {

  lista: { categoria: string; promedio: number }[] = [];

  public chartType: TipoGrafico = 'bar';

  public chartData: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [
      {
        label: 'Costo promedio por reclamo',
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
        text: 'Costo promedio por reclamo atendido (S/)'
      },
      tooltip: {
        callbacks: { label: ctx => ' ' + soles(Math.round(Number(ctx.raw))) }
      }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  constructor(private rS: Reporteservice, private dS: Datosservice, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.obtenerPromedio();
  }

  obtenerPromedio(): void {

    forkJoin({ costos: this.rS.costoPorCategoria(), datos: this.dS.cargar() }).subscribe({

      next: ({ costos, datos }) => {

        this.lista = costos.map(c => {
          const atendidos = datos.testimonios.filter(t =>
            datos.cat.get(t.idCategoria)?.nombreCategoria === c.categoria && ['EN_PROCESO', 'RESUELTO'].includes(t.estado)).length
          return { categoria: c.categoria, promedio: atendidos ? Number(c.totalCosto) / atendidos : 0 }
        }).filter(x => x.promedio > 0).sort((a, b) => b.promedio - a.promedio);

        this.chartData = {
          labels: this.lista.map(item => item.categoria),
          datasets: [
            {
              label: 'Costo promedio (S/)',
              data: this.lista.map(item => item.promedio),
              backgroundColor: this.lista.map(item => colorReal(colorCategoria(item.categoria))),
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
