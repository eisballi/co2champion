import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { KeyValueItem } from '../interfaces/shared';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  constructor(private httpClient: HttpClient) {}

  public getAllPersons() {
    return this.httpClient.get<KeyValueItem[]>('/api/persons');
  }
}
