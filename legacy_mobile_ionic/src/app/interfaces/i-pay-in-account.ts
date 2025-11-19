/**
 * Model for the creation of reconciliations
 */
export interface IInternalReconciliations {
    ReconDate: string;
    CardOrAccount: string;
    InternalReconciliationOpenTransRows: IInternalReconciliationRows[];
}

/**
 * Lines that make up reconciliation
 */
export interface IInternalReconciliationRows {
    CreditOrDebit: string;
    ReconcileAmount: number;
    ShortName: string;
    SrcObjAbs: number;
    SrcObjTyp: string;
    CashDiscount: number;
    Selected: string;
    TransRowId: number;
    TransId: number;
}

export interface InternalReconciliationsResponse {
    ReconNum: number;
}