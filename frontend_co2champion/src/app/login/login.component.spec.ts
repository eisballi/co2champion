import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { routes } from '../app.routes';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [RouterModule, MatSnackBarModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule, MatFormFieldModule]
})
export class LoginComponent {
navigateToRanking() {
throw new Error('Method not implemented.');
}
register() {
throw new Error('Method not implemented.');
}
registerFormGroup: FormGroup<any>;
registerFormGroup: FormGroup<any>;
navigateToRegister() {
throw new Error('Method not implemented.');
}
  loginFormGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackbar: MatSnackBar
  ) {
    this.loginFormGroup = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login(): void {
    if (this.loginFormGroup.valid) {
      const { username, password } = this.loginFormGroup.value;
      // Hier sollte die Login-Logik integriert werden
      console.log('Login:', username, password);
    } else {
      this.snackbar.open('Please fill in all required fields', 'OK', { duration: 3000 });
    }
  }
}
