import { Component, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-progress-chart',
  standalone: true, // Standalone-Komponente
  templateUrl: './progress-chart.component.html',
  styleUrls: ['./progress-chart.component.scss'],
})
export class ProgressChartComponent implements OnChanges {
  @Input() value: number = 0; // Der Wert für den Gauge Chart (z. B. Geschwindigkeit)
  @Input() max: number = 240; // Der Maximalwert für den Chart (z. B. km/h)

  private chartInstance: echarts.ECharts | undefined;

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] || changes['max']) {
      this.updateChart();
    }
  }

  private initChart(): void {
    if (!this.chartInstance) {
      const chartDom = this.el.nativeElement.querySelector('#progressChart');
      this.chartInstance = echarts.init(chartDom, 'dark');
    }
  }

  private updateChart(): void {
    this.initChart();

    if (this.chartInstance) {
      const option: echarts.EChartsOption = {
        series: [
          {
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: this.max, // Maximalwert dynamisch setzen
            splitNumber: 5,
            itemStyle: {
              color: '#58D9F9',
              shadowColor: 'rgba(0,138,255,0.45)',
              shadowBlur: 10,
              shadowOffsetX: 2,
              shadowOffsetY: 2,
            },
            progress: {
              show: true,
              roundCap: true,
              width: 18,
            },
            pointer: {
              icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
              length: '75%',
              width: 16,
              offsetCenter: [0, '5%'],
            },
            axisLine: {
              roundCap: true,
              lineStyle: {
                width: 18,
              },
            },
            axisTick: {
              splitNumber: 2,
              lineStyle: {
                width: 2,
                color: '#999',
              },
            },
            splitLine: {
              length: 12,
              lineStyle: {
                width: 3,
                color: '#999',
              },
            },
            axisLabel: {
              distance: 30,
              color: '#999',
              fontSize: 16,
            },
            title: {
              show: false,
            },
            detail: {
              backgroundColor: '#fff',
              borderColor: '#999',
              borderWidth: 3,
              width: '60%',
              lineHeight: 50,
              height: 45,
              borderRadius: 8,
              offsetCenter: [0, '45%'],
              valueAnimation: true,
              formatter: (value) => {
                return `{value|${value.toFixed(0)}}{unit|%}`;
              },
              rich: {
                value: {
                  fontSize: 30,
                  fontWeight: 'bolder',
                  color: '#777',
                },
                unit: {
                  fontSize: 20,
                  color: '#999',
                  padding: [0, 0, 0, 5],
                },
              },
            },
            data: [
              {
                value: this.value, // Dynamischer Wert
              },
            ],
          },
        ],
      };
      this.chartInstance.setOption(option);
    }
  }
}
