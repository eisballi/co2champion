import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RankingChartComponent } from '../ranking-chart/ranking-chart.component';
import { RankingService } from '../services/ranking.service';
import { UserService } from '../services/user.service'; 
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
  isLoggedIn: boolean = false;

  top10Names: string[] = [];
  top10Scores: number[] = [];

  constructor(
    private rankingService: RankingService,
    private userService: UserService 
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.userService.isLoggedInSignal(); 
    this.fetchRankingData();
  }

  fetchRankingData(): void {
    this.rankingService.getRanking().subscribe({
      next: (data) => {
        this.rankingData = data.results;
        this.updateRankingGraphAndTable();
        if (this.isLoggedIn) {
          this.fetchUserCompany(); 
        }
      },
      error: (err) => console.error('Error fetching ranking data:', err),
    });
  }
  

  fetchUserCompany(): void {
    this.rankingService.getUserCompany().subscribe({
      next: (data) => {
        
        const company = data[0];
        
        this.userCompany = {
          ...company,
          rank: company.current_rank  
        };
      },
      error: (err) => console.error('Error fetching user company:', err),
    });
  }
  
  

  private updateRankingGraphAndTable(): void {
    this.top10Companies = this.rankingData.slice(0, 10);
    this.top10Names = this.top10Companies.map((c) => c.name);
    this.top10Scores = this.top10Companies.map((c) => c.score);

    this.top10Companies.forEach((company) => {
      company.progress = Math.round(company.progress);
    });
  }

  private findUserCompanyRank(): number {
    if (!this.userCompany || !this.rankingData) return 0;
    const index = this.rankingData.findIndex(
      (company) => company.id === this.userCompany.id
    );
    return index === -1 ? 0 : index + 1;
  }
  
  isUserCompanyNotInTop10(): boolean {
    return this.isLoggedIn && 
           this.userCompany && 
           this.userCompany.id && 
           this.top10Companies && 
           this.top10Companies.length > 0 &&
           !this.top10Companies.some(c => c.id === this.userCompany.id);
  }
  
  
}
