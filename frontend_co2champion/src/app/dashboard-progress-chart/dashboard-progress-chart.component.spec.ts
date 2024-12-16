import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardProgressChartComponent } from './dashboard-progress-chart.component';

describe('DashboardProgressChartComponent', () => {
  let component: DashboardProgressChartComponent;
  let fixture: ComponentFixture<DashboardProgressChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardProgressChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardProgressChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
