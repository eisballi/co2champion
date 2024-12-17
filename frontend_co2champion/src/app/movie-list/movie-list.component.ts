import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  startWith,
  Subscription,
  switchMap,
} from 'rxjs';
import { Movie } from '../interfaces/movie.model';
import { MovieService } from '../services/movie.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    AsyncPipe,
    MatTableModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
  ],
  styleUrls: ['./movie-list.component.scss'],
})
export class MovieListComponent implements OnInit, OnDestroy {
  movies: Movie[] = [];
  filterControl = new FormControl('');
  subscription: Subscription | undefined;
  movies$: Observable<Movie[]> | undefined;
  displayedColumns = [
    'title',
    'released',
    'run_time',
    'genres',
    'black_and_white',
    'edit',
    'delete',
  ];

  constructor(private movieService: MovieService, public userService: UserService) {}

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngOnInit(): void {
    // -------------------------------------------------------
    // Only required if the alternative is not used
    this.movieService.getMovies().subscribe((movies) => {
      this.movies = movies.data;
    });

    this.subscription = this.filterControl.valueChanges
      .pipe(
        debounceTime(500),
        switchMap((newValue) => {
          return this.movieService.getMovies({ title: newValue || '' });
        }),
      )
      .subscribe((response) => {
        this.movies = response.data;
      });
    // ---------------------------------------------------------

    // **** Alternative ****
    // Instead of assigning the movies returned by the backend to a variable
    // we assign the whole Observable to a variable and bind it directly to the view via the AsyncPipe
    // Then we don't need the above code

    this.movies$ = this.filterControl.valueChanges.pipe(
      startWith(''),
      distinctUntilChanged(),
      debounceTime(500),
      switchMap((newValue) =>
        this.movieService.getMovies(newValue ? { title: newValue } : undefined),
      ),
      map((response) => response.data),
    );
  }

  deleteMovie(id: number) {
    this.movieService.delete(id).subscribe(() => {
      alert('Movie deleted');
      this.ngOnInit();
    });
  }

  public getGenres(movie: Movie) {
    return movie.genres.map((genre) => genre.name).join(', ');
  }
}
