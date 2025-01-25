import { Routes } from '@angular/router';
import { Co2championDashboardComponent } from './co2champion-dashboard/co2champion-dashboard.component';
import { Co2championEditReportComponent } from './co2champion-edit-report/co2champion-edit-report.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth.guard';
import { ImprintComponent } from './imprint/imprint.component';
import { GdprComponent } from './gdpr/gdpr.component';
import { AddReportComponent } from './add-report/add-report.component';
import { SetGoalComponent } from './set-goal/set-goal.component';
import { RegisterComponent } from './register/register.component';
import { RankingComponent } from './ranking/ranking.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: Co2championDashboardComponent, canActivate: [authGuard] },
  { path: 'ranking', component: RankingComponent, /* canActivate: [authGuard] */ }, // Jeder darf auf das Ranking zugreifen
  { path: 'add-report', component: AddReportComponent, canActivate: [authGuard] },
  { path: 'set-goal', component: SetGoalComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: 'imprint', component: ImprintComponent },
  { path: 'gdpr', component: GdprComponent },
  { path: 'log-out', component: Co2championDashboardComponent, canActivate: [authGuard] },
  { path: 'edit-report/:id', component: Co2championEditReportComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
