import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { CategoriaReporteDTO } from '../../../models/ReporteDTO';
import { Reporteservice } from '../../../services/reporteservice';
import { colorCategoria } from '../../../shared/ui';
import { colorReal } from '../../../shared/graficos';
type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

// US08 - Cantidad de reclamos por categoria
@Component({
  selector: 'app-reporte01component',
  imports: [BaseChartDirective],
  templateUrl: './reporte01component.html',
  styleUrl: './reporte01component.css',
})
export class Reporte01component implements OnInit {

  lista: CategoriaReporteDTO[] = [];

  public chartType: TipoGrafico = 'doughnut';

  public chartData: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [
      {
        label: 'Cantidad de reclamos por categoría',
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
        text: 'Cantidad de reclamos por categoría'
      }
    }
  };

  constructor(private rS: Reporteservice, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.obtenerCantidad();
  }

  obtenerCantidad(): void {

    this.rS.porCategoria().subscribe({

      next: (data: CategoriaReporteDTO[]) => {

        this.lista = [...data].sort((a, b) => b.cantidadTestimonios - a.cantidadTestimonios);

        this.chartData = {
          labels: this.lista.map(item => item.nombreCategoria),
          datasets: [
            {
              label: 'Cantidad de reclamos',
              data: this.lista.map(item => item.cantidadTestimonios),
              backgroundColor: this.lista.map(item => colorReal(colorCategoria(item.nombreCategoria))),
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
