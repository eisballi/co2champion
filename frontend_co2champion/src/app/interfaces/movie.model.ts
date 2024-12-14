import { KeyValueItem } from './shared';

export interface Page<T> {
  data: T[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

export interface Movie {
  id: number;
  title: string;
  genres: KeyValueItem[];
  year: number;
  released: string;
  run_time: number;
  rating: number;
  actors: KeyValueItem[];
  director: KeyValueItem;
  description: string;
  revenue?: string;
  black_and_white: boolean;
}
