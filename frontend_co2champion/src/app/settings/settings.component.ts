import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Material Modules you use in the template
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { CompanyService } from '../services/company.service';

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
export class SettingsComponent {
  settingsForm!: FormGroup;
  companyId!: number; // We'll store the company's primary key from the backend

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Create the form structure
    this.settingsForm = this.fb.group({
      UID: [{ value: '', disabled: true }],      // Typically read-only
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],       // For demonstration
      total_employees: [0, Validators.required],
      total_income: [0, Validators.required]
    });

    // Fetch the current user's Company
    this.companyService.getCurrentCompany().subscribe({
      next: (companies) => {
        if (companies.length === 1) {
          const c = companies[0];
          this.companyId = c.id; // We'll use this for updates/deletes
          this.settingsForm.patchValue({
            UID: c.UID,
            name: c.name,
            email: c.email,
            password: c.password,             // NOTE: not secure in real apps
            total_employees: c.total_employees,
            total_income: c.total_income
          });
        } else {
          alert('Could not load your company data.');
        }
      },
      error: (err) => {
        console.error(err);
        alert('Error loading account information');
      }
    });
  }

  onSubmit(): void {
    if (this.settingsForm.valid) {
      // Grab the form data
      const updatedData = this.settingsForm.getRawValue(); 
      // getRawValue() also includes disabled controls like UID

      // Send PUT request to /api/company/<id>/
      this.companyService.updateCompany(this.companyId, updatedData).subscribe({
        next: (res) => {
          alert('Account updated successfully!');
        },
        error: (err) => {
          console.error(err);
          alert('Error updating account');
        }
      });
    }
  }

  onDeleteAccount(): void {
    if (confirm('Are you sure you want to DELETE your account? This cannot be undone.')) {
      this.companyService.deleteCompany(this.companyId).subscribe({
        next: () => {
          alert('Your account has been deleted. We are sorry to see you go!');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error(err);
          alert('Error deleting account');
        }
      });
    }
  }
}