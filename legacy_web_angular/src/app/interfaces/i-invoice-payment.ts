export interface InvoiceOpen {
  DocEntry: number;
  DocNum: number;
  DocumentType: string;
  CardCode: string;
  CardName: string;
  NumAtCard: string;
  DocCurrency: string;
  TotalTable: number;
  Total: number;
  Saldo: number;
  SaldoTable: number;
  TotalUSD: number;
  SaldoUSD: number;
  Pago:number;
  DocDate: string;
  DocDueDate: string;
  InstlmntID: number;
  Assigned:boolean;
  TransId: number;
  ObjType : string;
}
