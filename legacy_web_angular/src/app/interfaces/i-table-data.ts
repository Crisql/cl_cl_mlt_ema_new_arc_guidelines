
export interface TableData {
  Action: number;
  Color: string;
  Data: string;
  Icon: string;
  Title: string;
}

export interface CheckboxColumnSelection<T> {
  Row: T
  EventName: string
  RowIndex: number
  CurrentPage: number
  ItemsPeerPage: number
}
