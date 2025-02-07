import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-rank-line-chart',
  standalone: true, 
  templateUrl: './dashboard-rank-progress-chart.component.html',
  styleUrls: ['./dashboard-rank-progress-chart.component.scss'],
})
export class DashboardRankLineChartComponent implements OnInit {
  @Input() xAxisRankData: string[] = [];
  @Input() seriesRankData: number[] = [];

  constructor() {}

  ngOnInit(): void {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['xAxisRankData'] || changes['seriesRankData'])) {
      this.initChart();
    }
  }

  private initChart(): void {
    const chartDom = document.getElementById('rankLineChart');
    const myChart = echarts.init(chartDom, 'dark');

    const option: echarts.EChartsOption = {
      xAxis: {
        type: 'category',
        data: this.xAxisRankData,
        axisLine: {
          show: true,
          lineStyle: {
            color: '#5470C6',
          },
          symbol: ['none', 'arrow'],
        },
      },
      yAxis: {
        type: 'value',
        name: 'Rank',
        position: 'left',
        inverse: true,
        min: 1,
        alignTicks: true,
        axisLine: {
          show: true,
          lineStyle: {
            color: '#5470C6',
          },
          symbol: ['none', 'arrow'],
        },
        axisLabel: {
          formatter: '{value}',
        },
      },
      grid: {
        left: '4%',
        right: '5%',
        bottom: '12%',
        containLabel: true,
      },
      toolbox: {
        feature: {
          saveAsImage: { show: true },
        },
      },
      series: [
        {
          data: this.seriesRankData,
          type: 'line',
        },
      ],
    };

    myChart.setOption(option,);
  }
}
