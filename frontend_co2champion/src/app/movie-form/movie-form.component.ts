import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { StarRatingModule } from 'angular-star-rating';
import { DateComponent } from '../date/date.component';
import { KeyValueItem } from '../interfaces/shared';
import { GenreService } from '../services/genre.service';
import { MovieService } from '../services/movie.service';
import { PersonService } from '../services/person.service';

@Component({
  selector: 'app-movie-form',
  standalone: true,
  imports: [
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    DateComponent,
    StarRatingModule,
  ],
  templateUrl: './movie-form.component.html',
  styleUrl: './movie-form.component.scss',
})
export class MovieFormComponent {
  movieFormGroup: FormGroup;
  id: number | undefined = undefined;
  personOptions: KeyValueItem[] = [];
  genreOptions: KeyValueItem[] = [];

  constructor(
    private movieService: MovieService,
    private route: ActivatedRoute,
    private personService: PersonService,
    private genreService: GenreService,
  ) {
    this.movieFormGroup = new FormGroup({
      id: new FormControl(null),
      title: new FormControl('', [
        Validators.required,
        this.badWordValidator(),
      ]),
      rank: new FormControl(''),
      description: new FormControl(''),
      genres: new FormControl([]),
      actors: new FormControl([]),
      director: new FormControl([]),
      released: new FormControl(new Date()),
      run_time: new FormControl(null, [Validators.max(300)]),
      rating: new FormControl(null),
      black_and_white: new FormControl(false),
    });
  }

  ngOnInit(): void {
    this.personService.getAllPersons().subscribe((response) => {
      this.personOptions = response;
    });

    this.genreService.getAllGenres().subscribe((response) => {
      this.genreOptions = response;
    });

    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.id) {
      this.movieService.getMovie(this.id).subscribe((movie) => {
        this.movieFormGroup.patchValue({
          ...movie,
          genres: movie.genres.map((genre) => genre.id),
          actors: movie.actors.map((actor) => actor.id),
          director: movie.director.id,
        });
      });
    }
  }

  createOrUpdateMovie() {
    if (this.id) {
      this.movieService
        .update(this.movieFormGroup.value, this.id)
        .subscribe(() => {
          alert('Movie updated successfully!');
        });
    } else {
      this.movieService.create(this.movieFormGroup.value).subscribe(() => {
        alert('Movie created successfully!');
      });
    }
  }

  badWordValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const forbidden = /bad word/.test(control.value);
      return forbidden ? { badWord: { value: control.value } } : null;
    };
  }
}
