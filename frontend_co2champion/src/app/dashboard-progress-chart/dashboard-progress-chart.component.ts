import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  templateUrl: './dashboard-progress-chart.component.html',
  styleUrls: ['./dashboard-progress-chart.component.scss'],
})
export class DashboardLineChartComponent implements OnInit {
  @Input() xAxisData: string[] = [];
  @Input() seriesData: number[] = [];

  constructor() {}

  ngOnInit(): void {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['xAxisData'] || changes['seriesData'])) {
      this.initChart();
    }
  }

  private initChart(): void {
    const chartDom = document.getElementById('lineChart');
    const myChart = echarts.init(chartDom, 'dark');

    const option: echarts.EChartsOption = {
      xAxis: {
        type: 'category',
        data: this.xAxisData,
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
          data: this.seriesData,
          type: 'line',
        },
      ],
    };

    myChart.setOption(option,);
  }
}
