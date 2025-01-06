import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GoalModel } from '../interfaces/goal.model';

@Injectable({
  providedIn: 'root',
})
export class GoalService {
  constructor(private http: HttpClient) {}

  // Goal der eigenen Company laden
  setGoal(goalData: GoalModel): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    });
    return this.http.post('/api/goal/', goalData, { headers });
  }

  getGoal(): Observable<GoalModel[]> {
    return this.http.get<GoalModel[]>('/api/goal/');
  }

  // Goal für die eigene Company erstellen
  createGoal(goal: GoalModel): Observable<GoalModel> {
    return this.http.post<GoalModel>('/api/goal/', goal);
  }

  // Goal aktualisieren (nur eigenes Goal)
  updateGoal(id: number, goal: GoalModel): Observable<GoalModel> {
    return this.http.put<GoalModel>(`/api/goal/${id}/`, goal);
  }

  createOrUpdateGoal(goalData: GoalModel): Observable<any> {
    if (goalData.id) {
        return this.updateGoal(goalData.id, goalData);
    }
    return this.createGoal(goalData);
}

  // Goal löschen (nur eigenes Goal)
  deleteGoal(id: number): Observable<void> {
    return this.http.delete<void>(`/api/goal/${id}/`);
  }
}
