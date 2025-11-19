/**
 * The interface represents the model of SAP accounts for payments
 */
export interface IAccount {
    AcctName: string;
    AcctCode: string;
    ActCurr: string;
    Id: number;
    Type: number;
}
