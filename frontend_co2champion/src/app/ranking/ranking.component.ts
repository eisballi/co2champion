import { Component, OnInit } from '@angular/core';
import { RankingService } from '../services/ranking.service';
import { CommonModule } from '@angular/common';
import { DashboardLineChartComponent } from '../dashboard-progress-chart/dashboard-progress-chart.component';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, DashboardLineChartComponent],
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.scss'
})
export class RankingComponent implements OnInit {
  rankingData: any[] = [];
  top10Companies: any[] = [];
  userCompany: any | null = null;

  // Pre-calculated arrays for graph
  top10Names: string[] = [];
  top10Scores: number[] = [];

  constructor(private rankingService: RankingService) {}

  ngOnInit(): void {
    this.fetchRankingData();
  }

  fetchRankingData(): void {
    this.rankingService.getRanking().subscribe({
      next: (data) => {
        if (JSON.stringify(data) !== JSON.stringify(this.rankingData)) {
          this.rankingData = data;
          this.updateRankingGraphAndTable();
        }
      },
      error: (err) => console.error('Error fetching ranking data:', err),
    });
  }
  
  private updateRankingGraphAndTable(): void {
    this.top10Companies = this.rankingData.slice(0, 10);
    this.userCompany = this.rankingData.length > 10 ? this.rankingData[10] : null;
    this.top10Names = this.top10Companies.map((c) => c.name);
    this.top10Scores = this.top10Companies.map((c) => c.score);
  }
  
}