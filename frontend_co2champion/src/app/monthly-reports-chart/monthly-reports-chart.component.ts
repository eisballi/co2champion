import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsCoreOption } from 'echarts/core';

echarts.use([BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

@Component({
  selector: 'app-monthly-reports-chart',
  standalone: true,
  templateUrl: './monthly-reports-chart.component.html',
  styleUrls: ['./monthly-reports-chart.component.scss'],
})
export class MonthlyReportsChartComponent implements OnInit {
  @Input() monthlyReportsChartMonths: string[] = []; // Variable Anzahl von Monaten
  @Input() monthlyReportsChartReportsCount: number[] = []; // Daten für Anzahl der Reports
  @Input() monthlyReportsChartMonthlyEmissions: number[] = []; // Daten für reduzierte Emissionen

  constructor() {}

  ngOnInit(): void {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['monthlyReportsChartMonths'] ||
      changes['monthlyReportsChartReportsCount'] ||
      changes['monthlyReportsChartMonthlyEmissions']
    ) {
      this.initChart();
    }
  }

  private initChart(): void {
    const chartDom = document.getElementById('monthlyReportsChart')!;
    const myChart = echarts.init(chartDom, 'dark');
    var option: EChartsCoreOption;

    const colors = ['#5470C6', '#91CC75', '#EE6666'];

    option = {
      color: colors,

      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      grid: {
        right: '15%'
      },
      toolbox: {
        feature: {
          saveAsImage: { show: true }
        }
      },
      legend: {
        data: ['Reduced Emissions', 'Number of Reports']
      },
      xAxis: [
        {
          type: 'category',
          axisTick: {
            alignWithLabel: true
          },
          // prettier-ignore
          data: this.monthlyReportsChartMonths
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Reduced Emissions',
          position: 'right',
          alignTicks: true,
          axisLine: {
            show: true,
            lineStyle: {
              color: colors[1]
            }
          },
          axisLabel: {
            formatter: '{value} (T/Y)'
          }
        },
        {
          type: 'value',
          name: 'Number of Reports',
          position: 'left',
          alignTicks: true,
          axisLine: {
            show: true,
            lineStyle: {
              color: colors[0]
            }
          },
          axisLabel: {
            formatter: '{value}'
          }
        }
      ],
      series: [
        {
          name: 'Number of Reports',
          type: 'bar',
          yAxisIndex: 1,
          data: this.monthlyReportsChartReportsCount
        },
        {
          name: 'Reduced Emissions',
          type: 'bar',
          data: this.monthlyReportsChartMonthlyEmissions
        }
      ]
    };

    option && myChart.setOption(option);
  }
}
