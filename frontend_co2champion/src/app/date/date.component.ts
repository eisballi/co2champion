import {
  AfterViewInit,
  Component,
  DestroyRef,
  forwardRef,
  Input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss'],
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateComponent),
      multi: true,
    },
  ],
})
export class DateComponent
  implements OnInit, ControlValueAccessor, AfterViewInit
{
  date: FormControl = new FormControl();
  propagateChange: any;

  @Input()
  placeholder = '';
  @Input()
  title: string = 'Date';
  @Input()
  required = false;

  constructor(
    private fb: FormBuilder,
    private destroyRef: DestroyRef,
  ) {}
  ngAfterViewInit(): void {
    
    this.date.setValue(this.date.value);
  }

  ngOnInit() {
    let validator = null;
    if (this.required) {
      validator = Validators.required;
    }
    this.date = this.fb.control(null, { validators: validator });
    this.date.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((newValue) => {
        const newDate = newValue
          ? new Date(newValue.getTime() - newValue.getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 10)
          : null;
        this.propagateChange(newDate);
        console.log(this.date.value);
      });
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    // do nothing
  }

  setDisabledState(isDisabled: boolean): void {
    // do nothing
  }

  writeValue(obj: any): void {
    this.date.setValue(obj, { emitEvent: false });
  }

  hasError(errorName: string) {
    return this.date.hasError(errorName);
  }
}
