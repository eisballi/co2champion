import { GoalModel } from "../interfaces/goal.model";
import { ReportModel } from "../interfaces/report.model";
import { RankHistoryModel } from "../interfaces/rank-history.model";

export class ChartHandler {

  static getEmissionsProgress(goal: GoalModel, reports: ReportModel[]): { xAxisData: string[], seriesData: number[] } {
    reports.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const startDate = new Date(goal.start_date);
    const deadline = new Date(goal.deadline);

    let currentEmissions = parseFloat(goal.start_emissions.toString());
    let xAxisData: string[] = [];
    let seriesData: number[] = [];

    const relevantReports = reports.filter(report => {
      const reportDate = new Date(report.date);
      return reportDate >= startDate && reportDate <= deadline;
    });

    xAxisData.push(this.formatDate(startDate));
    seriesData.push(currentEmissions);

    relevantReports.forEach(report => {
      const reportDate = new Date(report.date);

      currentEmissions -= parseFloat(report.reduced_emissions.toString());

      xAxisData.push(this.formatDate(reportDate));
      seriesData.push(currentEmissions);
    });

    xAxisData.push(this.formatDate(deadline));
    seriesData.push(currentEmissions);

    return { xAxisData, seriesData };
  }

  static formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: '2-digit', year: '2-digit' };
    return date.toLocaleDateString('de-DE', options);
  }

  static getRankHistoryData(rankHistory: RankHistoryModel[]): { xAxisRankData: string[], seriesRankData: number[] } {
    const sortedRankHistory = rankHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let xAxisRankData: string[] = [];
    let seriesRankData: number[] = [];

    sortedRankHistory.forEach((entry) => {
      const formattedDate = this.formatDate(new Date(entry.date));
      xAxisRankData.push(formattedDate);
      seriesRankData.push(entry.rank);
    });

    return { xAxisRankData, seriesRankData };
  }

  static getReportsVsEmissionsData(reports: ReportModel[]): { months: string[], reportsCount: number[], monthlyEmissions: number[] } {
    const reportsByMonth = new Map<string, { count: number; emissions: number }>();

    reports.forEach((report) => {
      const monthKey = new Date(report.date).toLocaleString('default', { year: 'numeric', month: 'short' });

      if (!reportsByMonth.has(monthKey)) {
        reportsByMonth.set(monthKey, { count: 0, emissions: 0 });
      }

      const current = reportsByMonth.get(monthKey)!;
      reportsByMonth.set(monthKey, {
        count: current.count + 1,
        emissions: current.emissions + Number(report.reduced_emissions), // <-- Sichere Umwandlung in Zahl
      });
    });

    // 2. Map in sortiertes Array umwandeln
    const sortedMonths = Array.from(reportsByMonth.entries()).sort((a, b) => {
      const dateA = new Date(a[0] + ' 1').getTime(); // Umwandlung in Date für Vergleich
      const dateB = new Date(b[0] + ' 1').getTime();
      return dateA - dateB;
    });

    // 3. Daten in Arrays übertragen
    const months = sortedMonths.map(([month]) => month);
    const reportsCount = sortedMonths.map(([_, data]) => data.count);
    const monthlyEmissions = sortedMonths.map(([_, data]) => data.emissions);

    return { months, reportsCount, monthlyEmissions };
  }

  static getCurrentPieChartProgress(companyGoal: GoalModel, reportData: ReportModel[]): number {

    const totalReduced = reportData.reduce((total: number, report) => {
      return total + (parseFloat(report.reduced_emissions.toString()) || 0);
    }, 0);


    const remainingEmissions = companyGoal.start_emissions - totalReduced;

    if (remainingEmissions <= 0) {
      return 100
    }

    return (remainingEmissions / companyGoal.target_emissions);
  }
}
