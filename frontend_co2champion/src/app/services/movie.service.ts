import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Movie, Page } from '../interfaces/movie.model';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  constructor(private http: HttpClient) {}

  getMovies(queryParams?: Record<string, string>) {
    return this.http.get<Page<Movie>>('/api/movies/', { params: queryParams });
  }

  getMovie(id: number) {
    return this.http.get<Movie>('/api/movies/' + id + '/');
  }

  create(movie: Movie) {
    return this.http.post('/api/movies/', movie);
  }

  update(movie: Movie, id: number) {
    return this.http.put(`/api/movies/${id}/`, movie);
  }

  delete(id: number) {
    return this.http.delete(`/api/movies/${id}/`);
  }
}
