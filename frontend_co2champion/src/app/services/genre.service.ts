import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { KeyValueItem } from '../interfaces/shared';

@Injectable({
  providedIn: 'root',
})
export class GenreService {
  constructor(private httpClient: HttpClient) {}

  public getAllGenres() {
    return this.httpClient.get<KeyValueItem[]>('/api/genres');
  }
}
