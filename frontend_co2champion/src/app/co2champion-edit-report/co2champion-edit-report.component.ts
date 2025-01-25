import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from '../services/report.service'; 
import { DateComponent } from '../date/date.component';

@Component({
  selector: 'app-co2champion-edit-report',
  standalone: true,
  imports: [
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    DateComponent
  ],
  templateUrl: './co2champion-edit-report.component.html',
  styleUrls: ['./co2champion-edit-report.component.scss'],
})
export class Co2championEditReportComponent {
  reportFormGroup: FormGroup;
  reportId: number | undefined = undefined;

  constructor(
    private reportService: ReportService,
    private route: ActivatedRoute
  ) {
    this.reportFormGroup = new FormGroup({
      id: new FormControl(null),
      title: new FormControl('', [Validators.required, Validators.maxLength(200),]),
      description: new FormControl('', [Validators.required, Validators.maxLength(800),]),
      date: new FormControl(new Date(), Validators.required,),
      reduced_emissions: new FormControl(null, [Validators.required, Validators.max(999999.99),]),
      company: new FormControl(null),
    });
  }

  ngOnInit(): void {
    this.reportId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.reportId) {
      this.reportService.getReport(this.reportId).subscribe((report) => {
        this.reportFormGroup.patchValue({
          id: report.id,
          title: report.title,
          description: report.description,
          date: report.date,
          reduced_emissions: report.reduced_emissions,
          company: report.company
        });
      });
    }
  }

  saveReport(): void {
    if (this.reportFormGroup.valid) {
      const reportData = this.reportFormGroup.value;
      // Update Report, or alert user if something did not work (e.g. 404 report not found)
      if (this.reportId) {
        this.reportService.update(reportData, this.reportId).subscribe(
          () => {
            alert('Report updated successfully!');
          },
          (error) => {
            alert(`Error updating report: ${error.message || 'Something went wrong'}`);
          }
        );
      }
    }
  }
}
