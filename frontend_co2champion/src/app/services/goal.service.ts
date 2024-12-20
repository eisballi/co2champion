import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GoalModel } from '../interfaces/goal.model';

@Injectable({
  providedIn: 'root',
})
export class GoalService {
  constructor(private http: HttpClient) {}

  // Goal der eigenen Company laden
  getGoal(queryParams?: Record<string, string>): Observable<GoalModel[]> {
    return this.http.get<GoalModel[]>('/api/goal/', { params: queryParams });
  }

  // Goal für die eigene Company erstellen
  createGoal(goal: GoalModel): Observable<GoalModel> {
    return this.http.post<GoalModel>('/api/goal/', goal);
  }

  // Goal aktualisieren (nur eigenes Goal)
  updateGoal(id: number, goal: GoalModel): Observable<GoalModel> {
    return this.http.put<GoalModel>(`/api/goal/${id}/`, goal);
  }

  // Goal löschen (nur eigenes Goal)
  deleteGoal(id: number): Observable<void> {
    return this.http.delete<void>(`/api/goal/${id}/`);
  }
}
