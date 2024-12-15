import { Routes } from '@angular/router';
import { MovieFormComponent } from './movie-form/movie-form.component';
import { MovieListComponent } from './movie-list/movie-list.component';
import { Co2championDashboardComponent } from './co2champion-dashboard/co2champion-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/movie-list', pathMatch: 'full' },
  { path: 'movie-list', component: MovieListComponent },
  { path: 'movie-form', component: MovieFormComponent },
  { path: 'movie-form/:id', component: MovieFormComponent },
  { path: 'dashboard', component: Co2championDashboardComponent },

  { path: 'ranking', component: Co2championDashboardComponent },
  { path: 'add-report', component: Co2championDashboardComponent },
  { path: 'set-goal', component: Co2championDashboardComponent },
  { path: 'settings', component: Co2championDashboardComponent },
  { path: 'imprint', component: Co2championDashboardComponent },
  { path: 'gdpr', component: Co2championDashboardComponent },
  { path: 'log-out', component: Co2championDashboardComponent },
  { path: 'edit-report/:id', component: EditReportFormComponent },
];
