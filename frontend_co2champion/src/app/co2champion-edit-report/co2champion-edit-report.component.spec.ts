import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Co2championEditReportComponent } from './co2champion-edit-report.component';

describe('Co2championEditReportComponent', () => {
  let component: Co2championEditReportComponent;
  let fixture: ComponentFixture<Co2championEditReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Co2championEditReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Co2championEditReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
