import {LogEvent} from "../common";

/**
 * The interface is used to mapping log modelo of table LogEvents
 */
export interface ILogEvent {
    //Type event
    Event: LogEvent.INFO | LogEvent.SUCCESS | LogEvent.WARNING | LogEvent.ERROR ;
    //View
    View: string;
    //Details
    Detail: string;
    //Document key
    DocumentKey: string;
}