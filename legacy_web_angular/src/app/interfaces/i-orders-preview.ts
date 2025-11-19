import {IDocumentLine} from "@app/interfaces/i-items";


export interface ITotalsPreviewSLDocument {
  DocTotal: number;
  DocTotalSys: number;
}
export interface ISalesServicePreview {
  Document: IDocumentPreview
}
export interface IDocumentPreview {
  CardCode: string;
  DocumentLines: IDocumentLine[];
}

