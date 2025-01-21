import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Company {
  id: number;
  UID: string;
  name: string;
  email: string;
  password: string;        // NOTE: Storing password in plain text is generally unsafe!
  total_employees: number;
  total_income: number;
  current_rank: number;
}


@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private baseUrl = '/api/company'; // Points to your Django ViewSet

  constructor(private http: HttpClient) {}

  /**
   * Get the current user's company. By design, your backend returns exactly
   * one item in the array (the user’s own company) if you call GET /api/company.
   */
  getCurrentCompany(): Observable<Company[]> {
    // This will yield an array with exactly one Company object.
    return this.http.get<Company[]>(this.baseUrl + '/');
  }

  /**
   * Update the current user's company. You must pass the actual company ID 
   * to the route: e.g. PUT /api/company/<id>/
   */
  updateCompany(id: number, data: Partial<Company>): Observable<Company> {
    return this.http.put<Company>(`${this.baseUrl}/${id}/`, data);
  }

  /**
   * Delete the current user's company: DELETE /api/company/<id>/
   */
  deleteCompany(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}/`);
  }
}
