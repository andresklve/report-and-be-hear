import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { InversionDepartamentoDTO } from '../../../models/ReporteDTO';
import { Reporteservice } from '../../../services/reporteservice';
import { soles } from '../../../shared/ui';
import { colorReal } from '../../../shared/graficos';
type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

// US11 - Inversion por departamento (barras horizontales, de mayor a menor)
@Component({
  selector: 'app-reporte04component',
  imports: [BaseChartDirective],
  templateUrl: './reporte04component.html',
  styleUrl: './reporte04component.css',
})
export class Reporte04component implements OnInit {

  lista: InversionDepartamentoDTO[] = [];

  public chartType: TipoGrafico = 'bar';

  public chartData: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [
      {
        label: 'Inversión por departamento',
        data: [],
        borderWidth: 1
      }
    ]
  };

  public chartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Inversión por departamento (S/)'
      },
      tooltip: {
        callbacks: { label: ctx => ' ' + soles(Number(ctx.raw)) }
      }
    },
    scales: {
      y: { ticks: { autoSkip: false, font: { size: 11 } } }
    }
  };

  constructor(private rS: Reporteservice, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.obtenerInversion();
  }

  obtenerInversion(): void {

    this.rS.inversionPorDepartamento().subscribe({

      next: (data: InversionDepartamentoDTO[]) => {

        this.lista = [...data].sort((a, b) => Number(b.totalInversion) - Number(a.totalInversion));

        this.chartData = {
          labels: this.lista.map(item => item.departamento),
          datasets: [
            {
              label: 'Inversión (S/)',
              data: this.lista.map(item => Number(item.totalInversion ?? 0)),
              backgroundColor: colorReal('var(--chart-dinero)', '#00876C'),
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
