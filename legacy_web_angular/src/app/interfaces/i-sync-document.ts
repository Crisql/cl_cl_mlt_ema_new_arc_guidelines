import {IBaseEntity} from "@app/interfaces/i-base-entity";
import {DocumentSyncStatus} from "@app/enums/enums";

export interface ISyncDocument extends IBaseEntity {
  UserAssignId: number;
  OfflineDate: Date | string;
  BackupsRequestAmount: number;
  TransactionType: string;
  TransactionStatus: DocumentSyncStatus;
  TransactionDetail: string;
  DocEntry: number;
  DocNum: number;
  DocumentKey: string;
  DocumentType: string;
  RawDocument: string;
}

export interface ISyncDocumentsPaged {
  SyncDocuments: ISyncDocument[];
  Count: number;
}

export interface ISyncDocumentFilter {
  Filter: string;
  Status: string;
  Type: string;
  From: Date;
  To: Date;
  Skip: number;
  Take: number;
}

