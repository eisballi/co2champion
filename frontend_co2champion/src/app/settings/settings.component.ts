import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Material Modules you use in the template
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { CompanyService } from '../services/company.service';
import { UserService } from '../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackbar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.settingsForm = this.fb.group({
      first_name: [
        '',
        [Validators.required, Validators.pattern('^[A-Za-z]{2,50}$')],
      ],
      last_name: [
        '',
        [Validators.required, Validators.pattern('^[A-Za-z]{2,50}$')],
      ],
      // Entferntes E-Mail-Feld
      /*
      email: ['', [Validators.required, Validators.email]],
      */
      company_name: [
        '',
        [Validators.required, Validators.pattern('^[A-Za-z0-9 &]{2,50}$')],
      ],
      total_employees: [
        '',
        [Validators.required, Validators.min(4)],
      ],
      total_income: ['', [Validators.required, Validators.min(5000)]],
    });

    this.loadAccountData();
  }

  loadAccountData(): void {
    this.loading = true;
    this.userService.getMyAccount().subscribe({
      next: (data: any) => {
        
        const { email, ...rest } = data;
        this.settingsForm.patchValue(rest);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackbar.open('Failed to load account data.', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  onSaveChanges(): void {
    if (this.settingsForm.invalid) {
      this.snackbar.open('Please correct the errors in the form.', 'Close', {
        duration: 3000,
      });
      return;
    }

    const formValues = this.settingsForm.value;

    this.loading = true;
    this.userService.updateMyAccount(formValues).subscribe({
      next: () => {
        this.snackbar.open('Settings updated successfully!', 'Close', {
          duration: 3000,
        });
        this.loading = false;
      },
      error: () => {
        this.snackbar.open('Failed to update settings.', 'Close', {
          duration: 3000,
        });
        this.loading = false;
      },
    });
  }

  onDeleteAccount(): void {
    if (!confirm('Are you sure you want to permanently delete your account?')) {
      return;
    }
  
    this.loading = true;
    this.userService.deleteMyAccount().subscribe({
      next: () => {
        this.snackbar.open('Account deleted successfully!', 'Close', {
          duration: 3000,
        });
        this.userService.logout(); // Clear session/token
        this.router.navigate(['/login']);
        this.loading = false;
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.snackbar.open('Failed to delete account.', 'Close', {
          duration: 3000,
        });
        this.loading = false;
      },
    });
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const control = this.settingsForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.settingsForm.get(fieldName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      return 'This field is required.';
    }
    if (control.errors['email']) {
      return 'Please enter a valid email address.';
    }
    if (control.errors['pattern']) {
      if (fieldName === 'first_name' || fieldName === 'last_name') {
        return 'Only letters (2-50 chars) are allowed.';
      }
      if (fieldName === 'company_name') {
        return 'Only letters, numbers, spaces & (2-50 chars) are allowed.';
      }
    }
    if (control.errors['min']) {
      if (fieldName === 'total_employees') {
        return 'Number of employees must be at least 4.';
      }
      if (fieldName === 'total_income') {
        return 'Annual income must be at least 5000.';
      }
    }
    return 'Invalid field.';
  }
}