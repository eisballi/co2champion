import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-ranking-chart',
  standalone: true,
  templateUrl: './ranking-chart.component.html',
  styleUrls: ['./ranking-chart.component.scss'],
})
export class RankingChartComponent implements OnInit, OnChanges {
  @Input() xAxisData: string[] = [];
  @Input() seriesData: number[] = [];

  @ViewChild('lineChartContainer', { static: true })
  chartContainer!: ElementRef;

  private myChart: echarts.ECharts | null = null;

  ngOnInit(): void {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['xAxisData'] || changes['seriesData']) {
      this.initChart();
    }
  }

  private initChart(): void {
    if (!this.chartContainer) return;

    const element = this.chartContainer.nativeElement;
    this.myChart = echarts.init(element, 'dark'); // ECharts mit dem "dark"-Theme

    // Balkendaten: Platz 1, 2, 3 farblich hervorheben
    const chartData = this.seriesData.map((val, idx) => {
      if (idx === 0) {
        return { value: val, itemStyle: { color: 'gold' } };
      } else if (idx === 1) {
        return { value: val, itemStyle: { color: 'silver' } };
      } else if (idx === 2) {
        return { value: val, itemStyle: { color: '#CD7F32' } }; // Bronze
      }
      return { value: val };
    });

    const option: echarts.EChartsOption = {
      title: {
        text: 'Top 10 Ranking (Score)',
        left: 'center',
        textStyle: {
          color: '#fff',
          fontSize: 18,
        },
      },
      // Keine spezielle Tooltip-Formatter => zeigt die vollen Dezimalwerte
      tooltip: {
        trigger: 'axis',
      },
      toolbox: {
        feature: {
          saveAsImage: { show: true },
          dataZoom: { show: true },
        },
      },
      xAxis: {
        type: 'category',
        data: this.xAxisData,
        axisLine: {
          lineStyle: { color: '#fff' },
        },
      },
      // Keine Rundung in axisLabel => Achse zeigt Dezimalwerte
      yAxis: {
        type: 'value',
        name: 'Score',
        axisLine: {
          lineStyle: { color: '#fff' },
        },
      },
      dataZoom: [
        { type: 'inside' },
        { type: 'slider' },
      ],
      grid: {
        left: '4%',
        right: '4%',
        bottom: '8%',
        containLabel: true,
      },
      series: [
        {
          data: chartData,
          type: 'bar',
          // Nur das Label auf dem Balken runden wir
          label: {
            show: true,
            position: 'top',
            color: '#fff',
            formatter: (param: any) => {
              // param.data.value ist der Wert des Balkens
              const rawVal = param?.data?.value ?? 0;
              const numericVal = typeof rawVal === 'number'
                ? rawVal
                : parseFloat(String(rawVal)) || 0;
              // Nur hier runden wir
              return Math.round(numericVal).toString();
            },
          },
          markPoint: {
            data: [
              { type: 'max', name: 'Max' },
              { type: 'min', name: 'Min' },
            ],
            label: {
              formatter: (param: any): string => {
                // param.value => der ungefilterte Wert
                const rawVal = param?.value ?? 0;
                // toNumber konvertieren & runden
                const numericVal = typeof rawVal === 'number'
                  ? rawVal
                  : parseFloat(String(rawVal)) || 0;
                return Math.round(numericVal).toString();
              },
            },
          },
          markLine: {
            data: [{ type: 'average', name: 'Avg' }],
            lineStyle: {
              color: '#fff',
              type: 'dashed',
            },
            label: {
              formatter: (param: any): string => {
                // param.value => der ungefilterte Durchschnittswert
                const rawVal = param?.value ?? 0;
                const numericVal = typeof rawVal === 'number'
                  ? rawVal
                  : parseFloat(String(rawVal)) || 0;
                return Math.round(numericVal).toString();
              },
            },
          },
        },
      ],
    };

    this.myChart.setOption(option);
    this.myChart.resize();
  }
}
