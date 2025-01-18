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
  generatedUsername: string = '';
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.registerFormGroup = this.fb.group(
      {
        // ==============
        // Company Fields
        // ==============
        company_name: [
          '',
          [
            Validators.required,
            // Nur Buchstaben und Zahlen, 2-50 Zeichen
            Validators.pattern('^[A-Za-z0-9]{2,50}$')
          ]
        ],
        company_uid: [
          '',
          [
            Validators.required,
            // Nur Großbuchstaben und Zahlen, 8-15 Zeichen
            Validators.pattern('^[A-Z0-9]{8,15}$')
          ]
        ],
        employee_size: [
          '',
          [
            Validators.required,
            // Mitarbeiter > 3
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

        // ========================
        // Representative Fields
        // ========================
        rep_first_name: [
          '',
          [
            Validators.required,
            // Nur Buchstaben, 2-50 Zeichen
            Validators.pattern('^[A-Za-z]{2,50}$')
          ]
        ],
        rep_last_name: [
          '',
          [
            Validators.required,
            // Nur Buchstaben, 2-50 Zeichen
            Validators.pattern('^[A-Za-z]{2,50}$')
          ]
        ],
        username: [{ value: '', disabled: true }, [Validators.required]],
        email: [
          '',
          [
            Validators.required,
            Validators.email
          ]
        ],

        // ========================
        // Password Fields
        // ========================
        password: [
          '',
          [
            Validators.required,
            // Min. 8 Zeichen, mind. 1 Groß, 1 Klein, 1 Ziffer, 1 Sonderzeichen
            Validators.pattern(
              '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$'
            )
          ]
        ],
        confirm_password: ['', [Validators.required]]
      },
      {
        validators: this.passwordMatchValidator
      }
    );
  }

  /**
   * Custom Validator: Check, ob password und confirm_password übereinstimmen
   */
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirm_password')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  /**
   * Generiert den Username aus dem Company Name
   */
  generateUsername(): void {
    const companyNameControl = this.registerFormGroup.get('company_name');
    if (!companyNameControl) return;

    const rawCompanyName = companyNameControl.value || '';
    // Nur alphanumerisch und klein geschrieben, '_' für alle nicht Buchstaben/Zahlen
    const sanitized = rawCompanyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_');

    this.generatedUsername = sanitized;
    // Da das Feld disabled ist, patchen wir den Wert mithilfe patchValue
    this.registerFormGroup.patchValue({ username: this.generatedUsername });
  }

  /**
   * Kurzer Check, ob Feld ungültig ist
   */
  isFieldInvalid(fieldName: string): boolean {
    const control = this.registerFormGroup.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Error-Message-Handler
   */
  getErrorMessage(fieldName: string): string {
    const control = this.registerFormGroup.get(fieldName);
    if (!control || !control.errors) return '';

    // Alle möglichen Fehler
    const errors = control.errors;
    if (errors['required']) {
      // Benutzerdefinierte Meldungen je nach Feld
      switch (fieldName) {
        case 'company_name':
          return 'Please enter a company name.';
        case 'company_uid':
          return 'Please enter a valid Company UID.';
        case 'employee_size':
          return 'Number of employees is required.';
        case 'total_income':
          return 'Annual income is required.';
        case 'rep_first_name':
          return 'First name is required.';
        case 'rep_last_name':
          return 'Last name is required.';
        case 'username':
          return 'Username is required.'; // Theoretisch nie leereingabe, da generiert
        case 'email':
          return 'Email is required.';
        case 'password':
          return 'Password is required.';
        case 'confirm_password':
          return 'Please confirm your password.';
      }
    }
    if (errors['pattern']) {
      switch (fieldName) {
        case 'company_name':
          return 'Company name must be 2-50 letters/digits, no special characters.';
        case 'company_uid':
          return 'UID must be 8-15 uppercase letters/digits only.';
        case 'rep_first_name':
          return 'First name must be 2-50 letters only.';
        case 'rep_last_name':
          return 'Last name must be 2-50 letters only.';
        case 'password':
          return 'Password must have min 8 chars, at least one uppercase, one lowercase, one digit, and one special character.';
      }
    }
    if (errors['email']) {
      return 'Please enter a valid email address.';
    }
    if (errors['min']) {
      if (fieldName === 'employee_size') {
        return 'Number of employees must be at least 4.';
      }
      if (fieldName === 'total_income') {
        return 'Annual income must be at least 5000.';
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

    // Wenn Formular ungültig: Fehler markieren + Meldung ausgeben
    if (this.registerFormGroup.invalid) {
      this.registerFormGroup.markAllAsTouched();
      this.snackBar.open('Please correct the errors in the form.', 'Close', {
        duration: 3000
      });
      return;
    }

    // Formular ist gültig -> Daten absenden
    const rawData = this.registerFormGroup.getRawValue();
    // Da username disabled war, müssen wir ihn ggf. aus generatedUsername ziehen
    // (getRawValue() enthält disabled Felder, also sollte es passen)
    const formData = {
      company_name: rawData.company_name,
      company_uid: rawData.company_uid,
      employee_size: rawData.employee_size,
      total_income: rawData.total_income,
      representative: {
        first_name: rawData.rep_first_name,
        last_name: rawData.rep_last_name,
        username: rawData.username, // auto generiert
        email: rawData.email,
        password: rawData.password
      }
    };

    this.userService.register(formData).subscribe({
      next: () => {
        this.snackBar.open(
          'Registration successful! Redirecting to login...',
          'Close',
          { duration: 3000 }
        );
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.snackBar.open(
          error?.error?.message || 'Registration failed. Please try again.',
          'Close',
          { duration: 5000 }
        );
      }
    });
  }

  /**
   * Zur Login-Seite zurückkehren
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}