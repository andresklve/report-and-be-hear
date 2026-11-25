import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { CostoCategoriaDTO } from '../../../models/ReporteDTO';
import { Reporteservice } from '../../../services/reporteservice';
import { colorCategoria, soles } from '../../../shared/ui';
import { colorReal } from '../../../shared/graficos';
type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

// US12 - Costo invertido por categoria
@Component({
  selector: 'app-reporte03component',
  imports: [BaseChartDirective],
  templateUrl: './reporte03component.html',
  styleUrl: './reporte03component.css',
})
export class Reporte03component implements OnInit {

  lista: CostoCategoriaDTO[] = [];

  public chartType: TipoGrafico = 'pie';

  public chartData: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [
      {
        label: 'Costo por categoría',
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
        text: 'Costo invertido por categoría'
      },
      tooltip: {
        callbacks: { label: ctx => ' ' + soles(Number(ctx.raw)) }
      }
    }
  };

  constructor(private rS: Reporteservice, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.obtenerCosto();
  }

  obtenerCosto(): void {

    this.rS.costoPorCategoria().subscribe({

      next: (data: CostoCategoriaDTO[]) => {

        this.lista = data
          .filter(item => Number(item.totalCosto) > 0)
          .sort((a, b) => Number(b.totalCosto) - Number(a.totalCosto));

        this.chartData = {
          labels: this.lista.map(item => item.categoria),
          datasets: [
            {
              label: 'Costo (S/)',
              data: this.lista.map(item => Number(item.totalCosto)),
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
