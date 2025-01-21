import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportModel } from '../interfaces/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private apiUrl = '/api/reports/'; // Stellen Sie sicher, dass der Endpunkt korrekt ist

  constructor(private http: HttpClient) {}

  getReports(queryParams?: Record<string, string>): Observable<ReportModel[]> {
    return this.http.get<ReportModel[]>(this.apiUrl, { params: queryParams });
  }

  getReport(id: number): Observable<ReportModel> {
    return this.http.get<ReportModel>(`${this.apiUrl}${id}/`);
  }

  create(report: ReportModel): Observable<ReportModel> {
    const { title, description, reduced_emissions, date } = report;
    const reportData = { title, description, reduced_emissions, date };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    });
    return this.http.post<ReportModel>(this.apiUrl, reportData, { headers });
  }

  update(report: ReportModel, id: number): Observable<ReportModel> {
    const { title, description, reduced_emissions, date } = report;
    const reportData = { title, description, reduced_emissions, date };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    });
    return this.http.put<ReportModel>(`${this.apiUrl}${id}/`, reportData, { headers });
  }

  delete(id: number): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    });
    return this.http.delete<void>(`${this.apiUrl}${id}/`, { headers });
  }
}