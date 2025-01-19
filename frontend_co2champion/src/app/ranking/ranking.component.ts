// src/app/ranking/ranking.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLineChartComponent } from '../dashboard-progress-chart/dashboard-progress-chart.component';
import { RankingService } from '../services/ranking.service';
import { RankingChartComponent } from '../ranking-chart/ranking-chart.component';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, RankingChartComponent],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.scss']
})
export class RankingComponent implements OnInit {
  rankingData: any[] = [];
  top10Companies: any[] = [];
  userCompany: any | null = null;

  // For the chart
  top10Names: string[] = [];
  top10Scores: number[] = [];

  constructor(private rankingService: RankingService) {}

  ngOnInit(): void {
    this.fetchRankingData();
  }

  fetchRankingData(): void {
    this.rankingService.getRanking().subscribe({
      next: (data) => {
        // Wichtig: "data.results" ist das eigentliche Array
        this.rankingData = data.results; 
        this.updateRankingGraphAndTable();
      },
      error: (err) => console.error('Error fetching ranking data:', err),
    });
  }

  private updateRankingGraphAndTable(): void {
    // Nimm die ersten 10 Einträge als Top 10
    this.top10Companies = this.rankingData.slice(0, 10);

    // Optional: der 11. Eintrag könnte "deine" Firma sein, wenn du das willst.
    this.userCompany = this.rankingData.length > 10 ? this.rankingData[10] : null;

    this.top10Names = this.top10Companies.map((c) => c.name);
    this.top10Scores = this.top10Companies.map((c) => c.score);

    // Runde die Fortschrittswerte
    this.top10Companies.forEach((company) => {
      company.progress = Math.round(company.progress); // Ganze Zahlen
    });

    if (this.userCompany) {
      this.userCompany.progress = Math.round(this.userCompany.progress);
    }
  }
}
