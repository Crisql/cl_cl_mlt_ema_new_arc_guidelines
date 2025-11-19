import {IBaseEntity} from "@app/interfaces/i-base-entity";

export interface ILogEvent extends IBaseEntity {
  Event: string;
  View: string;
  Detail: string;
  DocumentKey: string;
}

export interface ILogEventFilter {
  Filter: string;
  Event: string;
  From: Date;
  To: Date;
  Skip: number;
  Take: number;
}
