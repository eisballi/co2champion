import { Component, OnInit, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  standalone: true
})
export class RegisterComponent implements OnInit {

  registerFormGroup!: FormGroup;
  submitted = false;  // kannst du nutzen, falls du etwas anderes daraus ableiten willst

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.registerFormGroup = this.fb.group(
      {
        company_name: [
          '',
          [
            Validators.required,
            // Beispielsweise nur Buchstaben, Zahlen, Leerzeichen, & (2-50 Zeichen)
            Validators.pattern('^(?=.*[^\\s].*[^\\s])[A-Za-z0-9 &]{2,50}$')
          ]
        ],
        company_uid: [
          '',
          [
            Validators.required,
            Validators.pattern('^[A-Z0-9]{8,15}$')
          ]
        ],
        employee_size: [
          '',
          [
            Validators.required,
            Validators.min(4)
          ]
        ],
        total_income: [
          '',
          [
            Validators.required,
            Validators.min(5000)
          ]
        ],

        rep_first_name: [
          '',
          [
            Validators.required,
            Validators.pattern('^[A-Za-zÄÖÜäöüß]{2,50}$')
          ]
        ],
        rep_last_name: [
          '',
          [
            Validators.required,
            Validators.pattern('^[A-Za-zÄÖÜäöüß]{2,50}$')
          ]
        ],

        // Username: nur Kleinbuchstaben + Ziffern, 3-30 Zeichen
        username: [
          '',
          [
            Validators.required,
            Validators.pattern('^[a-z0-9]{3,30}$')
          ]
        ],
        email: [
          '',
          [
            Validators.required,
            Validators.email
          ]
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$')
          ]
        ],
        confirm_password: [
          '',
          [Validators.required]
        ]
      },
      {
        validators: this.passwordMatchValidator
      }
    );
  }

  // Custom Validator: prüft, ob password == confirm_password
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirm_password')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      formGroup.get('confirm_password')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    formGroup.get('confirm_password')?.setErrors(null);
    return null;
  }

  /**
   * Check, ob ein Feld ungültig ist
   */
  isFieldInvalid(fieldName: string): boolean {
    const control = this.registerFormGroup.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  private getPasswordErrors(): string[] {
    const errors: string[] = [];
    const passwordControl = this.registerFormGroup.get('password');

    if (!passwordControl?.value) return errors;

    const value = passwordControl.value;

    if (!/[A-Z]/.test(value)) errors.push('at least one uppercase letter');
    if (!/[a-z]/.test(value)) errors.push('at least one lowercase letter');
    if (!/\d/.test(value)) errors.push('at least one number');
    if (!/[!@#$%^&*]/.test(value)) errors.push('at least one special character');
    if (value.length < 8) errors.push('minimum 8 characters');

    return errors;
  }

  /**
   * Zeigt Fehlertexte an
   */
  getErrorMessage(fieldName: string): string {
    const control = this.registerFormGroup.get(fieldName);
    if (!control || !control.errors) return '';

    // Falls wir via setErrors({ serverError: '...' }) gesetzt haben
    if (control.errors['serverError']) {
      return control.errors['serverError'];
    }

    // Standardfehler
    const errors = control.errors;
    if (errors['required']) {
      return 'This field is required.';
    }
    if (errors['pattern']) {
      if (fieldName === 'rep_first_name' || fieldName === 'rep_last_name') {
        return 'Only letters are allowed (2-50 characters)';
      }
      if (fieldName === 'username') {
        return 'Lowercase letters & numbers only (3-30 chars)';
      }
      if (fieldName === 'company_name') {
        return 'Letters, digits, spaces & (2-50 chars).';
      }
      if (fieldName === 'company_uid') {
        return 'UID must be 8-15 uppercase letters/digits.';
      }
    }
    if (errors['email']) {
      return 'Please enter a valid email address.';
    }
    if (errors['min']) {
      if (fieldName === 'employee_size') {
        return 'Employees must be >= 4.';
      }
      if (fieldName === 'total_income') {
        return 'Annual income must be >= 5000.';
      }
    }
    if (fieldName === 'password') {
      const errors = this.getPasswordErrors();
      if (errors.length > 0) {
        return 'Password requires: ' + errors.join(', ');
      }
    }
    if (errors['passwordMismatch']) {
      return 'Passwords do not match.';
    }
    return 'Invalid field.';
  }

  /**
   * Formular absenden
   */
  onRegister(): void {
    this.submitted = true;

    // Falls Formular ungültig -> Meldung
    if (this.registerFormGroup.invalid) {
      this.snackBar.open('Please correct the errors in the form.', 'Close', {
        duration: 3000
      });
      return;
    }

    // Formularwerte holen
    const rawData = this.registerFormGroup.getRawValue();

    const formData = {
      company_name: rawData.company_name,
      company_uid: rawData.company_uid,
      employee_size: rawData.employee_size,
      total_income: rawData.total_income,
      representative: {
        first_name: rawData.rep_first_name,
        last_name: rawData.rep_last_name,
        username: rawData.username,
        email: rawData.email,
        password: rawData.password
      }
    };

    // Request an dein Backend
    this.userService.register(formData).subscribe({
      next: () => {
        this.snackBar.open(
          'Registration successful! Redirecting to login...',
          'Close',
          { duration: 3000 }
        );
        this.router.navigate(['/login']);
      },
      error: (err) => {
        if (err?.status === 400 && err?.error) {
          // Serverseitige Validierungsfehler -> Felder zuordnen
          this.processServerValidationErrors(err.error);
        } else {
          this.snackBar.open(
            'Registration failed. Please try again.',
            'Close',
            { duration: 5000 }
          );
        }
      }
    });
  }

  /**
   * Verteilt Serverfehler an die jeweiligen Felder
   * Beispiel-JSON vom Server könnte sein:
   * {
   *   "company_uid": ["UID already exists."],
   *   "representative": {
   *       "username": ["Username already exists."],
   *       "email": ["Email already exists."]
   *   }
   * }
   */
  processServerValidationErrors(validationErrors: any): void {
    // Falls UID schon vergeben
    if (validationErrors.company_uid) {
      this.registerFormGroup
        .get('company_uid')
        ?.setErrors({ serverError: validationErrors.company_uid[0] });
    }

    // Falls CompanyName schon vergeben
    if (validationErrors.company_name) {
      this.registerFormGroup
        .get('company_name')
        ?.setErrors({ serverError: validationErrors.company_name[0] });
    }

    // Verschachtelt: representative.username
    if (validationErrors.representative) {
      const repErrors = validationErrors.representative;

      // Falls Username schon vergeben
      if (repErrors.username) {
        this.registerFormGroup
          .get('username')
          ?.setErrors({ serverError: repErrors.username[0] });
      }

      // Falls Email schon vergeben
      if (repErrors.email) {
        this.registerFormGroup
          .get('email')
          ?.setErrors({ serverError: repErrors.email[0] });
      }

      // Wenn du noch first_name, last_name etc. abfangen willst:
      // if (repErrors.first_name) { ... }
      // if (repErrors.last_name) { ... }
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}