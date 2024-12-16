import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPieChartComponent } from './progress-chart.component';

describe('DashboardPieChartComponent', () => {
  let component: DashboardPieChartComponent;
  let fixture: ComponentFixture<DashboardPieChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPieChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
