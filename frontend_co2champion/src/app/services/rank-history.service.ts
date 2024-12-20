import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RankHistoryModel } from '../interfaces/rank-history.model';

@Injectable({
  providedIn: 'root',
})
export class RankHistoryService {
  constructor(private http: HttpClient) {}

  getRankHistory(queryParams?: Record<string, string>) {
    return this.http.get<RankHistoryModel[]>('/api/rank-history/', { params: queryParams });
  }

}