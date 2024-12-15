import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReportModel, Page } from '../interfaces/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor(private http: HttpClient) {}

  getReports(queryParams?: Record<string, string>) {
    return this.http.get<Page<ReportModel>>('/api/reports/', { params: queryParams });
  }

  getReport(id: number) {
    return this.http.get<ReportModel>('/api/report/' + id + '/');
  }

  create(report: ReportModel) {
    return this.http.post('/api/report/', report);
  }

  update(report: ReportModel, id: number) {
    return this.http.put(`/api/report/${id}/`, report);
  }

  delete(id: number) {
    return this.http.delete(`/api/report/${id}/`);
  }
}