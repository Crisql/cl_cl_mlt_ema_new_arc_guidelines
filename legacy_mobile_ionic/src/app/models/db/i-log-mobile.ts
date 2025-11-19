import { LogEvent } from "src/app/common";

export interface ILogMobile {
    Id: number;
    Event: LogEvent.INFO | LogEvent.SUCCESS | LogEvent.WARNING | LogEvent.ERROR ;  
    View: string;
    Detail: string;
    Date: string;
    User: string;
    SyncStatus: number; 
    DocumentKey: string;
    TransactionType: string;
    UserSign?: number;
}

