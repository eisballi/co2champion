import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { ReportService } from '../services/report.service';
import { ReportModel } from '../interfaces/report.model';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

// CHARTS: https://xieziyu.github.io/ngx-echarts/#/welcome
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([BarChart, GridComponent, CanvasRenderer]);
import { DashboardLineChartComponent } from '../dashboard-progress-chart/dashboard-progress-chart.component';
import { ProgressChartComponent } from '../dashboard-progress-pie-chart/progress-chart.component';
import { GoalService } from '../services/goal.service';
import { GoalModel } from '../interfaces/goal.model';
import { ChartHandler } from './ChartHandler';
import { MonthlyReportsChartComponent } from '../monthly-reports-chart/monthly-reports-chart.component';
import { DashboardRankLineChartComponent } from '../dashboard-rank-progress-chart/dashboard-rank-progress-chart.component';
import { RankHistoryService } from '../services/rank-history.service';
import { RankHistoryModel } from '../interfaces/rank-history.model';

@Component({
  selector: 'app-co2champion-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatPaginator,
    MatPaginatorModule,
    CommonModule,
    ProgressChartComponent,
    DashboardLineChartComponent,
    MonthlyReportsChartComponent,
    DashboardRankLineChartComponent
  ],
  templateUrl: './co2champion-dashboard.component.html',
  styleUrl: './co2champion-dashboard.component.scss',
  providers: [
    provideEchartsCore({ echarts }), DatePipe
  ]
})
export class Co2championDashboardComponent implements OnInit, OnDestroy {
  // Reports
  reportsDataSource = new MatTableDataSource<ReportModel>([]);
  reportHistoryColumns = ['title', 'description', 'date', 'reduced_emissions', 'edit', 'delete'];
  @ViewChild(MatPaginator) paginator!: MatPaginator; // Report Table Paginator
  // Goals
  companyGoal: GoalModel | undefined;
  // RankHistory
  rankHistoryDataSource = new MatTableDataSource<RankHistoryModel>([]);

  // CHARTS Variables + Default Values
  // - Progress Timeline
  charts_ProgressTimeline_Dates       = ['?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?'];
  charts_ProgressTimeline_Reductions  = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  // - Overall Progress
  charts_OverallProgress = 0;
  // - Reports vs. Reduced Emissions
  charts_ReportsVsReduction_Dates             = ['?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?'];
  charts_ReportsVsReduction_ReportsCounts     = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  charts_ReportsVsReduction_MonthlyReduction  = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  // - RankHistory
  charts_RankHistory_Dates = ['?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?', '?'];
  charts_RankHistory_Ranks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  constructor(
    private reportService: ReportService,
    private goalService: GoalService,
    private rankHistoryService: RankHistoryService,
    private datePipe: DatePipe // <--- hinzufügen
  ) { }
    

  ngOnInit(): void {
    this.reportService.getReports().subscribe((reports) => {
      this.reportsDataSource.data = reports;
      this.reportsDataSource.paginator = this.paginator;
      this.updateProgressTimeLineChartData();
      this.updateReportsVsEmissionsChartData();
    });

    this.goalService.getGoal().subscribe((response) => {
      this.companyGoal = response[0];
      this.updateOverallProgress();
      this.updateProgressTimeLineChartData();
      this.updateReportsVsEmissionsChartData();
    });

    this.rankHistoryService.getRankHistory().subscribe((response) => {
      this.rankHistoryDataSource.data = response;
      this.updateRankLineChartData();
    });
  }

  private updateProgressTimeLineChartData(): void {
    if (this.companyGoal) {
      var result = ChartHandler.getEmissionsProgress(this.companyGoal, this.reportsDataSource.data);
      this.charts_ProgressTimeline_Dates = [...result.xAxisData]; //TODO: Check if [... ] is necessary
      this.charts_ProgressTimeline_Reductions = [...result.seriesData];
    }
  }

  private updateRankLineChartData(): void {
    const result = ChartHandler.getRankHistoryData(this.rankHistoryDataSource.data);
    this.charts_RankHistory_Dates = [...result.xAxisRankData];
    this.charts_RankHistory_Ranks = [...result.seriesRankData];
  }

  private updateReportsVsEmissionsChartData(): void {
    const result = ChartHandler.getReportsVsEmissionsData(this.reportsDataSource.data);
    this.charts_ReportsVsReduction_Dates = [...result.months];
    this.charts_ReportsVsReduction_ReportsCounts = [...result.reportsCount];
    this.charts_ReportsVsReduction_MonthlyReduction = [...result.monthlyEmissions];
  }

  updateOverallProgress() {
    if (!this.companyGoal || !this.reportsDataSource.data) {
      this.charts_OverallProgress = 0;
    } else {
      this.charts_OverallProgress = ChartHandler.getCurrentPieChartProgress(this.companyGoal, this.reportsDataSource.data)
    }
  }

  ngOnDestroy(): void {
  }

  deleteReport(id: number) {
    this.reportService.delete(id).subscribe(() => {
      alert('Report deleted');
      this.ngOnInit();
    });
  }

  exportReports(): void {
    // 1) Daten aus der TableDataSource holen
    const reports = this.reportsDataSource.data; // ReportModel[]

    // 2) CSV-String erstellen
    const csvContent = this.generateCSV(reports);

    // 3) Datei-Download anstoßen
    this.downloadCSV(csvContent, 'reports_export.csv');
  }

  /**
   * Erzeugt aus einem Array von ReportModel einen CSV-String.
   */
  private generateCSV(data: ReportModel[]): string {
    const headers = ['Title', 'Description', 'Date', 'Reduced Emissions'];
  
    const rows = data.map(report => {
      // Date zu String konvertieren
      const formattedDate = report.date ? this.datePipe.transform(report.date, 'yyyy-MM-dd') : '';
      return [
        this.escapeCSV(report.title),
        this.escapeCSV(report.description),
        this.escapeCSV(formattedDate),
        this.escapeCSV(report.reduced_emissions.toString()),
      ].join(',');
    });
  
    return [headers.join(','), ...rows].join('\r\n');
  }

  /**
   * Startet den Download einer CSV-Datei mit dem übergebenen Inhalt.
   */
  private downloadCSV(csvData: string, filename: string): void {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

    // HTML-Element <a> erstellen, das den Download triggert
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Hilfsmethode, um Kommas, Anführungszeichen etc. in CSV-Zellen richtig zu maskieren.
   */
  private escapeCSV(value: string | null | undefined): string {
    if (!value) return '';
    // Doppelte Anführungszeichen innerhalb des Textes doppelt maskieren
    const escapedValue = value.replace(/"/g, '""');
    // Falls Value ein Komma oder Anführungszeichen enthält, mit Anführungszeichen umschließen
    if (escapedValue.search(/("|,|\n)/g) >= 0) {
      return `"${escapedValue}"`;
    }
    return escapedValue;
  }
}