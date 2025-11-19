
export interface LineMinified {
    Name: string;
    TaxCode: string;
    Quantity: number;
    Price: number;
    UgpEntry: number;
    SuoMEntry: number;
    Discount: number;
    TaxOnly: string;
}

export interface MinifiedItem {
    ItemCode: string;
    ItemName: string;
    BinCode: string;
    BinWhsCode: string;
    SerialNumber: string;
    SNWhsCode: string;
    BarCode?: string;
    OnHand?: string;
    DistNumberSerie?: string;
    DistNumberLote?: string;
    SysNumber?: string;
    ManBtchNum?: string;
    ManSerNum?: string;
    AbsEntry?: number | null;
    TypeAheadFormat?: string;
}

export interface ICashDeskClosingLine {
    Factura: number;
    NumRecibo: number;
    Total: number;
    PaidToDate: number;
    TotalCash: number;
    TotalTransfer: number;
    TotalCards: number;
    TotalCheck: number;
    DocumentState: string;
}