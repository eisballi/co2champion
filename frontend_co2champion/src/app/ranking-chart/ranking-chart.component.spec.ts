import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RankingChartComponent } from './ranking-chart.component';

describe('RankingChartComponent', () => {
  let component: RankingChartComponent;
  let fixture: ComponentFixture<RankingChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RankingChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RankingChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
