import { GoalModel } from "../interfaces/goal.model";
import { ReportModel } from "../interfaces/report.model";

export class EmissionsTracker {

  static getEmissionsProgress(goal: GoalModel, reports: ReportModel[]): { xAxisData: string[], seriesData: number[] } {
    const startDate = new Date(goal.start_date);
    const deadline = new Date(goal.deadline);

    let currentEmissions = parseFloat(goal.current_emissions.toString());
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

  private static formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: '2-digit' };
    return date.toLocaleDateString('de-DE', options);
  }
}
