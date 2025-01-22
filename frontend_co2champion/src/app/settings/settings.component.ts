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
      first_name: ['', Validators.required],
      last_name:  ['', Validators.required],
      email:      ['', [Validators.required, Validators.email]],
      company_name:     ['', Validators.required],
      total_employees:  ['', Validators.required],
      total_income:     ['', Validators.required],
    });

    this.loadAccountData();
  }

  loadAccountData(): void {
    this.loading = true;
    this.userService.getMyAccount().subscribe({
      next: (data: any) => {
        // data = { first_name, last_name, email, company_name, total_employees, total_income }
        this.settingsForm.patchValue(data);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.snackbar.open('Failed to load account data.', 'Close', { duration: 3000 });
      }
    });
  }

  onSaveChanges(): void {
    if (this.settingsForm.invalid) {
      this.snackbar.open('Please fill all required fields.', 'Close', { duration: 3000 });
      return;
    }
    const formValues = this.settingsForm.value;

    // formValues has shape:
    // {
    //   first_name, last_name, email,
    //   company_name, total_employees, total_income
    // }

    this.userService.updateMyAccount(formValues).subscribe({
      next: (res) => {
        this.snackbar.open('Settings updated!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackbar.open('Update failed.', 'Close', { duration: 3000 });
      }
    });
  }

  onDeleteAccount(): void {
    if (!confirm('Are you sure you want to permanently delete your account?')) {
      return;
    }
    this.userService.deleteMyAccount().subscribe({
      next: () => {
        this.snackbar.open('Account deleted!', 'Close', { duration: 3000 });
        this.userService.logout();    // Clear token, signals, etc.
        this.router.navigate(['/login']);  // or go to /login
      },
      error: () => {
        this.snackbar.open('Delete failed.', 'Close', { duration: 3000 });
      }
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
    if (control.errors['min']) {
      if (fieldName === 'total_employees') {
        return 'Employees must be >= 4.';
      }
      if (fieldName === 'total_income') {
        return 'Annual income must be >= 5000.';
      }
    }
    return 'Invalid field.';
  }
}