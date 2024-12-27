import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../services/user.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [MatSnackBarModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatCardModule, HttpClientModule],
  standalone: true
})
export class RegisterComponent {
  registerFormGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.registerFormGroup = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirm_password: ['', Validators.required],
    });
  }


  onRegister(): void {
    if (this.registerFormGroup.valid) {
      const { username, email, password, confirm_password } = this.registerFormGroup.value;
      if (password !== confirm_password) {
        alert("Passwords do not match!");
        return;
      }

      this.http.post('/api/register/', { username, email, password, confirm_password }).subscribe({
        next: () => {
          alert('Registration successful! Redirecting to login...');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error(error);
          alert('Registration failed. Please try again.');
        }
      });
    } else {
      alert('Please fill out all fields correctly.');
    }
  }
}
