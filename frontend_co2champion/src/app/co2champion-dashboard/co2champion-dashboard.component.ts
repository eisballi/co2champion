import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  startWith,
  Subscription,
  switchMap,
} from 'rxjs';
import { ReportService } from '../services/report.service';
import { ReportModel } from '../interfaces/report.model';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

// CHARTS: https://xieziyu.github.io/ngx-echarts/#/welcome
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([BarChart, GridComponent, CanvasRenderer]);
import type { EChartsCoreOption } from 'echarts/core';
import { DashboardLineChartComponent } from '../dashboard-progress-chart/dashboard-progress-chart.component';
import { ProgressChartComponent } from '../dashboard-progress-pie-chart/progress-chart.component';


@Component({
  selector: 'app-co2champion-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    AsyncPipe,
    MatTableModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatPaginator,
    MatPaginatorModule,
    CommonModule,
    NgxEchartsDirective,
    ProgressChartComponent,
    DashboardLineChartComponent
  ],
  templateUrl: './co2champion-dashboard.component.html',
  styleUrl: './co2champion-dashboard.component.scss',
  providers: [
    provideEchartsCore({ echarts }),
  ]
})
export class Co2championDashboardComponent implements OnInit, OnDestroy {
  reports: ReportModel[] = [];
  subscription: Subscription | undefined;
  reports$: Observable<Report[]> | undefined;
  dataSource = new MatTableDataSource<ReportModel>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator; // ViewChild für Paginator
  reportHistoryColumns = ['title', 'description', 'date', 'reduced_emissions', 'edit', 'delete'];
  constructor(private reportService: ReportService) { }

  // CHARTS
  chart1data!: EChartsCoreOption;
  xAxisData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  seriesData = [150, 230, 224, 218, 135, 147, 260];
  value = 35; // Aktueller Wert (z. B. Geschwindigkeit)
  max = 100; // Maximalwert (z. B. km/h)


  ngOnInit(): void {
    this.reportService.getReports().subscribe((reports) => {
      this.dataSource.data = reports; // DataSource aktualisieren
      this.dataSource.paginator = this.paginator; // Paginator an DataSource binden
    });
  }

  ngOnDestroy(): void {
    // Falls du zusätzliche Subscriptions hast
  }

  deleteReport(id: number) {
    this.reportService.delete(id).subscribe(() => {
      alert('Report deleted');
      this.ngOnInit();
    });
  }
}