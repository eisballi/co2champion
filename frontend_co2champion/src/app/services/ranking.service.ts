import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RankingService {
  private rankingUrl = '/api/ranking/';
  private userCompanyUrl = '/api/company/'; // Assuming endpoint is set up

  constructor(private http: HttpClient) {}

  getRanking(): Observable<any> {
    return this.http.get<any>(this.rankingUrl);
  }

  getUserCompany(): Observable<any> {
    return this.http.get<any>(this.userCompanyUrl); // Returns the logged-in user's company
  }
}