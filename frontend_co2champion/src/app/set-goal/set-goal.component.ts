import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors, AbstractControl, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GoalService } from '../services/goal.service';
import { GoalModel } from '../interfaces/goal.model';

@Component({
  selector: 'app-set-goal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './set-goal.component.html',
  styleUrls: ['./set-goal.component.scss']
})
export class SetGoalComponent implements OnInit {
  goalFormGroup: FormGroup;
  currentGoal: GoalModel | null = null;
  isGoalSet: boolean = false;
  showConfirmation: boolean = false;

  constructor(private goalService: GoalService) {
    this.goalFormGroup = new FormGroup({
      start_emissions: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(50),
        Validators.max(10000000)
      ]),
      target_emissions: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(1),
        Validators.max(10000000),
        this.targetGreaterThanStartValidator()
      ]),
      start_date: new FormControl<string | null>(null, [
        Validators.required,
        this.startDateValidator()
      ]),
      deadline: new FormControl<string | null>(null, [
        Validators.required,
        this.deadlineValidator()
      ])
    });
  }

  ngOnInit(): void {
    this.loadCurrentGoal();
  }

  private loadCurrentGoal(): void {
    this.goalService.getGoal().subscribe({
      next: (goals) => {
        if (goals && goals.length > 0) {
          this.currentGoal = goals[0];
          this.isGoalSet = true;
          this.goalFormGroup.patchValue({
            start_emissions: Number(this.currentGoal.start_emissions),
            target_emissions: Number(this.currentGoal.target_emissions),
            start_date: this.currentGoal.start_date,
            deadline: this.currentGoal.deadline,
          });
        } else {
          this.isGoalSet = false;
          this.currentGoal = null;
        }
      },
      error: (err) => console.error('Failed to load goal:', err),
    });
  }

  // Bestätigungsdialog-Handling
  onSubmitAttempt(event: Event): void {
    event.preventDefault();

    if (this.isGoalSet) {
      this.showConfirmation = true;
    } else {
      this.onSubmit();
    }
  }

  confirmUpdate(): void {
    this.showConfirmation = false;
    this.onSubmit();
  }

  cancelUpdate(): void {
    this.showConfirmation = false;
  }

  // Validatoren (unverändert)
  private targetGreaterThanStartValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const target = control.value;
      const start = this.goalFormGroup?.get('start_emissions')?.value;
      if (start == null || target == null) return null;
      if (target > start * 0.8) return { targetTooHigh: true };
      return null;
    };
  }

  private startDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const inputDate = new Date(control.value);
      const today = new Date();
      const minDate = new Date('1990-01-01');
      if (isNaN(inputDate.getTime())) return { invalidStartDate: true };
      if (inputDate < minDate) return { invalidStartDateBefore1990: true };
      if (inputDate > today) return { invalidStartDateFuture: true };
      return null;
    };
  }

  private deadlineValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const deadlineDate = new Date(control.value);
      const today = new Date();
      const maxDate = new Date('2149-12-31');
      const startDateControl = this.goalFormGroup?.get('start_date');
      if (!startDateControl) return null;
      const startDate = new Date(startDateControl.value);
      if (isNaN(deadlineDate.getTime())) return { invalidDeadline: true };
      if (deadlineDate <= today) return { deadlineNotInFuture: true };
      if (deadlineDate > maxDate) return { deadlineAfter2150: true };
      const sixMonthsAfterStart = new Date(startDate);
      sixMonthsAfterStart.setMonth(sixMonthsAfterStart.getMonth() + 6);
      if (deadlineDate < sixMonthsAfterStart) return { deadlineLessThan6Months: true };
      if (deadlineDate <= startDate) return { deadlineBeforeStartDate: true };
      return null;
    };
  }

  onSubmit(): void {
    if (this.goalFormGroup.valid) {
      const goalData: GoalModel = {
        ...this.goalFormGroup.value,
        start_emissions: this.goalFormGroup.value.start_emissions!.toString(),
        target_emissions: this.goalFormGroup.value.target_emissions!.toString(),
      };

      const handleError = (err: any) => {
        if (err.error) {
          const errorMessages = Object.values(err.error).flat().join(' ');
          alert(`Failed: ${errorMessages}`);
        } else {
          alert(`Error: ${err.message}`);
        }
      };

      if (this.isGoalSet && this.currentGoal) {
        this.goalService.updateGoal(this.currentGoal.id, goalData).subscribe({
          next: () => {
            alert('Goal updated successfully!');
            this.loadCurrentGoal();
          },
          error: handleError
        });
      } else {
        this.goalService.createGoal(goalData).subscribe({
          next: (response) => {
            alert('Goal created successfully!');
            this.isGoalSet = true;
            this.currentGoal = response;
            this.loadCurrentGoal();
          },
          error: handleError
        });
      }
    } else {
      this.goalFormGroup.markAllAsTouched();
      alert('Please fix the errors in the form before submitting.');
    }
  }
}