import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
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
  ],
  templateUrl: './co2champion-dashboard.component.html',
  styleUrl: './co2champion-dashboard.component.scss'
})
export class Co2championDashboardComponent implements OnInit, OnDestroy {
  reports: ReportModel[] = [];
  subscription: Subscription | undefined;
  reports$: Observable<Report[]> | undefined;
  reportHistoryColumns = [
    'title',
    'desc',
    'date',
    'emissions',
  ];
  constructor(private reportService: ReportService) {}

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

    ngOnInit(): void {
      this.reportService.getReports().subscribe((reports) => {
        this.reports = reports.data;
      });
    }

    deleteReport(id: number) {
      this.reportService.delete(id).subscribe(() => {
        alert('Report deleted');
        this.ngOnInit();
      });
    }
}
