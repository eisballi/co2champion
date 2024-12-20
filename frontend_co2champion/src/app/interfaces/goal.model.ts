// export interface Page<T> {
//   data: T[];
//   draw: number;
//   reportsTotal: number;
// }

export interface GoalModel {
  id: number;
  company: number
  current_emissions: number;
  target_emissions: number;
  deadline: Date;
  start_date: Date;
}
