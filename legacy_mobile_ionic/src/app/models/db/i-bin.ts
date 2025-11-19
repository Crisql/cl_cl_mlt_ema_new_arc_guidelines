export interface IBin {
    BinAbs: number;
    BinCode: string;
}

export interface IBinStock extends IBin {
    BatchNumber: string;
    Stock: number;
}

export interface IBinRequest extends IBinStock {
    State: boolean;
    Quantity: number;
}