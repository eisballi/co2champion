import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { ReportService } from '../services/report.service';
import { GoalService } from '../services/goal.service';
import { ReportModel } from '../interfaces/report.model';
import { GoalModel } from '../interfaces/goal.model';
import { CommonModule } from '@angular/common';
import { group } from '@angular/animations';
// import { group } from '@angular/animations';


@Component({
  selector: 'app-add-report',
  templateUrl: './add-report.component.html',
  styleUrls: ['./add-report.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class AddReportComponent implements OnInit {
  reportFormGroup: FormGroup;

  constructor(private reportService: ReportService) {
    this.reportFormGroup = new FormGroup({
      title: new FormControl('', [Validators.required, Validators.maxLength(200)]),
      description: new FormControl('', [Validators.required, Validators.maxLength(800)]),
      reduced_emissions: new FormControl('', [Validators.required, Validators.min(0), Validators.max(100000)]),
      date: new FormControl('', [Validators.required]),
      // goal: new FormControl(null, [Validators.required]), // Entfernt
    }, { validators: this.reportDateValidator });
  }

  ngOnInit(): void {
    // Keine Ziele mehr laden, da automatisch zugewiesen
  }

  // Custom Validator: Sicherstellen, dass ein Datum eingegeben wurde
  private reportDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const dateControl = control.get('date');

    if (!dateControl) return null;

    const date = dateControl.value;

    if (!date) {
      return { invalidDate: true };
    }

    return null;
  };

  // Helper Methoden für Validierungen
  isFieldInvalid(field: string): boolean {
    const control = this.reportFormGroup.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // Datum-Validierung im Frontend nur für das Vorhandensein
  isDateInvalid(): boolean {
    return !!(
      (this.reportFormGroup.get('date')?.invalid &&
        (this.reportFormGroup.get('date')?.dirty || this.reportFormGroup.get('date')?.touched)) ||
      this.reportFormGroup.hasError('invalidDate')
    );
  }

  onSubmit(): void {
    if (this.reportFormGroup.valid) {
      const reportData: ReportModel = {
        title: this.reportFormGroup.value.title,
        description: this.reportFormGroup.value.description,
        reduced_emissions: this.reportFormGroup.value.reduced_emissions.toString(),
        date: this.reportFormGroup.value.date,
        id: 0,
        company: 0
      };

      this.reportService.create(reportData).subscribe({
        next: () => {
          alert('Report successfully created!');
          this.reportFormGroup.reset();
        },
        error: (err) => {
          console.error('Error:', err);
          if (err.error && err.error.reduced_emissions) {
            alert(err.error.reduced_emissions);
          } else if (err.error && err.error.non_field_errors) {
            alert(err.error.non_field_errors);
          } else {
            alert('Failed to create report.');
          }
        },
      });
    } else {
      this.reportFormGroup.markAllAsTouched();
      console.error('Form is invalid:', this.reportFormGroup.errors);
      alert('Please fix the errors in the form before submitting.');
    }
  }
}