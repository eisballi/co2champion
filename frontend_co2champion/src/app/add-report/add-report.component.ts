import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ReportService } from '../services/report.service';
import { ReportModel } from '../interfaces/report.model';

@Component({
  selector: 'app-add-report',
  templateUrl: './add-report.component.html',
  styleUrls: ['./add-report.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class AddReportComponent implements OnInit {
  reportFormGroup: FormGroup;

  constructor(private reportService: ReportService) {
    this.reportFormGroup = new FormGroup({
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      reduced_emissions: new FormControl(0, [Validators.required, Validators.min(0)]),
      date: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.reportFormGroup.valid) {
      const reportData = { ...this.reportFormGroup.value }; // Ohne companyId
      this.reportService.create(reportData).subscribe({
        next: () => alert('Report successfully created!'),
        error: (err) => console.error('Error:', err),
      });
    } else {
      alert('Invalid form!');
    }
  }
}