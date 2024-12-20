import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-line-chart',
  standalone: true, // Standalone-Komponente
  templateUrl: './dashboard-progress-chart.component.html',
  styleUrls: ['./dashboard-progress-chart.component.scss'],
})
export class DashboardLineChartComponent implements OnInit {
  @Input() xAxisData: string[] = []; // X-Achse-Daten (z. B. ['Mon', 'Tue', ...])
  @Input() seriesData: number[] = []; // Werte für die Serie (z. B. [150, 230, ...])

  constructor() {}

  ngOnInit(): void {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['xAxisData'] || changes['seriesData'])) {
      this.initChart(); // Aktualisiere das Diagramm bei Änderungen
    }
  }

  private initChart(): void {
    const chartDom = document.getElementById('lineChart');
    const myChart = echarts.init(chartDom, 'dark');

    const option: echarts.EChartsOption = {
      xAxis: {
        type: 'category',
        data: this.xAxisData, // Initiale X-Achse-Daten
      },
      yAxis: {
        type: 'value',
        name: 'Yearly Emissions',
        position: 'left',
        alignTicks: true,
        axisLine: {
          show: true,
          lineStyle: {
            color: '#5470C6',
          },
        },
        axisLabel: {
          formatter: '{value} (T/Y)',
        },
      },
      grid: {
        left: '4%',
        right: '4%',
        bottom: '8%',
        containLabel: true,
      },
      toolbox: {
        feature: {
          saveAsImage: { show: true },
        },
      },
      series: [
        {
          data: this.seriesData, // Initiale Serien-Daten
          type: 'line',
        },
      ],
    };

    myChart.setOption(option,); // Initialisiere das Diagramm
  }
}
