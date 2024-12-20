import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyReportsChartComponent } from './monthly-reports-chart.component';

describe('MonthlyReportsChartComponent', () => {
  let component: MonthlyReportsChartComponent;
  let fixture: ComponentFixture<MonthlyReportsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyReportsChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyReportsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
