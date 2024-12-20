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
  empty,
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
import { GoalService } from '../services/goal.service';
import { GoalModel } from '../interfaces/goal.model';
import { EmissionsTracker } from './EmissionTracker';


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
    DashboardLineChartComponent,
  ],
  templateUrl: './co2champion-dashboard.component.html',
  styleUrl: './co2champion-dashboard.component.scss',
  providers: [
    provideEchartsCore({ echarts }),
  ]
})
export class Co2championDashboardComponent implements OnInit, OnDestroy {
  subscription: Subscription | undefined;

  // Reports
  reports: ReportModel[] = [];
  reportsDataSource = new MatTableDataSource<ReportModel>([]);
  reportHistoryColumns = ['title', 'description', 'date', 'reduced_emissions', 'edit', 'delete'];
  // Goals
  companyGoal: GoalModel | undefined;
  // Others
  @ViewChild(MatPaginator) paginator!: MatPaginator; // ViewChild für Paginator


  constructor(
    private reportService: ReportService,
    private goalService: GoalService) { }

  // CHARTS

  xAxisData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  seriesData = [0, 50, 100, 150, 100, 150, 200, 0, 50, 100, 150, 100, 150, 200];
  // Pie Chart
  pieChartCurrentProgress = 2;
  max = 100;


  ngOnInit(): void {
    this.reportService.getReports().subscribe((reports) => {
      this.reportsDataSource.data = reports;
      this.reportsDataSource.paginator = this.paginator;
      this.updateChartData();
    });

    this.goalService.getGoal().subscribe((response) => {
      this.companyGoal = response[0];
      this.pieChartCurrentProgress = this.getCurrentPieChartProgress();
      this.updateChartData();
    });
  }

  private updateChartData(): void {
    if (this.companyGoal) {
      var result = EmissionsTracker.getEmissionsProgress(this.companyGoal, this.reportsDataSource.data);
      this.xAxisData = result.xAxisData;
      this.seriesData = result.seriesData;
    }
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

  getCurrentPieChartProgress(): number {
    if (!this.companyGoal || !this.companyGoal.current_emissions || !this.companyGoal.target_emissions) {
      return 0;
    }

    // Berechnung des Fortschritts in Prozent
    return ((this.companyGoal.target_emissions / this.companyGoal.current_emissions) * 100);
  }
}