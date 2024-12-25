import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GoalModel } from '../interfaces/goal.model';
import { GoalService } from '../services/goal.service';

@Component({
  selector: 'app-set-goal',
  templateUrl: './set-goal.component.html',
  styleUrls: ['./set-goal.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class SetGoalComponent implements OnInit {
  goalFormGroup: FormGroup;
  currentGoalId: number | null = null; // Speichert die ID des aktuellen Ziels

  constructor(private goalService: GoalService) {
    this.goalFormGroup = new FormGroup({
      start_emissions: new FormControl('', [
        Validators.required,
        Validators.min(0),
      ]),
      target_emissions: new FormControl('', [
        Validators.required,
        Validators.min(0),
      ]),
      deadline: new FormControl('', Validators.required),
      start_date: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.loadCurrentGoal();
  }

  private loadCurrentGoal(): void {
    this.goalService.getGoal().subscribe({
      next: (goals) => {
        if (goals.length > 0) {
          const goal = goals[0]; // Nimm das erste Ziel
          this.currentGoalId = goal.id;

          // Fülle die Felder mit den vorhandenen Werten
          this.goalFormGroup.patchValue({
            start_emissions: goal.start_emissions,
            target_emissions: goal.target_emissions,
            deadline: goal.deadline,
            start_date: goal.start_date,
          });
        }
      },
      error: (err) => {
        console.error('Failed to load current goal:', err);
      },
    });
  }

  onChangeGoal(): void {
    alert('Change Goal clicked!');
    // Hier kannst du die gewünschte Logik für die Änderung des Ziels implementieren
  }


  onSubmit(): void {
    if (this.goalFormGroup.valid) {
      const goalData: GoalModel = this.goalFormGroup.value;

      if (this.currentGoalId) {
        // Aktualisiere das bestehende Ziel
        this.goalService.updateGoal(this.currentGoalId, goalData).subscribe({
          next: () => {
            alert('Goal successfully updated!');
          },
          error: (err) => {
            console.error('Failed to update goal:', err);
            alert('Failed to update goal: ' + err.error.detail || err.message);
          },
        });
      } else {
        // Erstelle ein neues Ziel
        this.goalService.createGoal(goalData).subscribe({
          next: (response) => {
            alert('Goal successfully created!');
            this.currentGoalId = response.id;
          },
          error: (err) => {
            console.error('Failed to create goal:', err);
            alert('Failed to create goal: ' + err.error.detail || err.message);
          },
        });
      }
    } else {
      alert('Please fill out all required fields.');
    }
  }
}
