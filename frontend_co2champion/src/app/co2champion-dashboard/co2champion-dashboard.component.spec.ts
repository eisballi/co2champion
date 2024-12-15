import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Co2championDashboardComponent } from './co2champion-dashboard.component';

describe('Co2championDashboardComponent', () => {
  let component: Co2championDashboardComponent;
  let fixture: ComponentFixture<Co2championDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Co2championDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Co2championDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
