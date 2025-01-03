// export interface Page<T> {
//   data: T[];
//   draw: number;
//   reportsTotal: number;
// }

export interface GoalModel {
  id: number;
  company: number;
  start_emissions: number;
  target_emissions: number;
  start_date: string; // als ISO-String
  deadline: string;   // als ISO-String
}
