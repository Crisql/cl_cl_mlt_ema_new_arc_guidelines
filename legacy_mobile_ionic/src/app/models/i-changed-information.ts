import {ChangeElement} from "../common/enum";

/**
 * Represent the model used to determinate what information was modified in SAP
 */
export interface IChangedInformation {
    /**
     * Information type
     */
    Type: ChangeElement;
    /**
     * Number of changes
     */
    Count: number;
    /**
     * Date of the last synchronization
     */
    SyncDate: string;
}
