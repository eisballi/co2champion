import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors, AbstractControl, ReactiveFormsModule } from '@angular/forms';
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

  constructor(private goalService: GoalService) {
    this.goalFormGroup = new FormGroup({
      start_emissions: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(1)
      ]),
      target_emissions: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(1),
        this.targetGreaterThanStartValidator.bind(this)
      ]),
      start_date: new FormControl<string | null>(null, [
        Validators.required,
        this.startDateValidator
      ]),
      deadline: new FormControl<string | null>(null, [
        Validators.required,
        this.endDateValidator.bind(this)
      ])
    });
  }

  ngOnInit(): void {
    this.loadCurrentGoal();
  }

  private loadCurrentGoal(): void {
    this.goalService.getGoal().subscribe({
      next: (goals) => {
        if (goals.length > 0) {
          this.currentGoal = goals[0];
          this.isGoalSet = true;
          this.goalFormGroup.patchValue({
            start_emissions: this.currentGoal.start_emissions,
            target_emissions: this.currentGoal.target_emissions,
            start_date: this.currentGoal.start_date,
            deadline: this.currentGoal.deadline,
          });
        }
      },
      error: (err) => console.error('Failed to load goal:', err),
    });
  }

  private targetGreaterThanStartValidator(control: AbstractControl): ValidationErrors | null {
    const target = control.value;
    const start = this.goalFormGroup?.get('start_emissions')?.value;

    if (start == null || target == null) return null;

    if (target >= start) {
      return { targetTooHigh: true };
    }
    if (target > start / 2) {
      return { targetTooLow: true };
    }
    return null;
  }

  private startDateValidator(control: AbstractControl): ValidationErrors | null {
    const today = new Date().setHours(0, 0, 0, 0); // Heute, Mitternacht
    const startDate = new Date(control.value).setHours(0, 0, 0, 0);

    if (isNaN(startDate) || startDate < today) {
      return { invalidStartDate: true };
    }
    return null;
  }

  private endDateValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = this.goalFormGroup?.get('start_date')?.value;
    const deadline = new Date(control.value).setHours(0, 0, 0, 0);

    if (!startDate || isNaN(deadline)) {
      return null;
    }

    const startDateParsed = new Date(startDate).setHours(0, 0, 0, 0);

    if (deadline <= startDateParsed) {
      return { invalidDeadline: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.goalFormGroup.valid) {
      const goalData: GoalModel = this.goalFormGroup.value;
  
      if (this.isGoalSet && this.currentGoal) {
        // Update Goal
        this.goalService.updateGoal(this.currentGoal.id, goalData).subscribe({
          next: () => {
            alert('Goal updated successfully!');
            this.loadCurrentGoal();
          },
          error: (err) => {
            alert('Failed to update goal: ' + err.message);
          },
        });
      } else {
        // Create Goal
        this.goalService.createGoal(goalData).subscribe({
          next: (response) => {
            alert('Goal created successfully!');
            this.isGoalSet = true;
            this.currentGoal = response; // Speichere das aktuelle Ziel
          },
          error: (err) => {
            alert('Failed to create goal: ' + err.message);
          },
        });
      }
    } else {
      alert('Please fill out all required fields!');
    }
  }
}
