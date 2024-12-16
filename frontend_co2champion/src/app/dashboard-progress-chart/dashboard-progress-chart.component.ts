import { Component, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-line-chart',
  standalone: true, // Standalone-Komponente
  templateUrl: './dashboard-progress-chart.component.html',
  styleUrls: ['./dashboard-progress-chart.component.scss'],
})
export class DashboardLineChartComponent implements OnChanges {
  @Input() xAxisData: string[] = []; // X-Achse-Daten (z. B. ['Mon', 'Tue', ...])
  @Input() seriesData: number[] = []; // Werte für die Serie (z. B. [150, 230, ...])

  private chartInstance: echarts.ECharts | undefined;

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['xAxisData'] || changes['seriesData']) {
      this.updateChart();
    }
  }

  private initChart(): void {
    // Initialisiere die ECharts-Instanz, falls sie noch nicht existiert
    if (!this.chartInstance) {
      const chartDom = this.el.nativeElement.querySelector('#lineChart');
      this.chartInstance = echarts.init(chartDom, 'dark');
    }
  }

  private updateChart(): void {
    this.initChart();

    if (this.chartInstance) {
      const option: echarts.EChartsOption = {
        xAxis: {
          type: 'category',
          data: this.xAxisData, // Dynamische X-Achse-Daten
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data: this.seriesData, // Dynamische Serien-Daten
            type: 'line',
          },
        ],
      };
      this.chartInstance.setOption(option); // Setze das Diagramm mit den Optionen
    }
  }
}
