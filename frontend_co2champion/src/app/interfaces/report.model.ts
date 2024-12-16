// export interface Page<T> {
//   data: T[];
//   draw: number;
//   reportsTotal: number;
// }

export interface ReportModel {
  id: number;
  title: string;
  description: string;
  date: Date;
  reduced_emissions: number;
}
