/**
 * Represent the sync information in the sync page
 */
export interface ISyncInfo {
    /**
     * Id of the process to synchronize
     */
    Id: number;
    /**
     * Result of the synchronized process
     */
    Result: boolean;
    /**
     * Indicates if the process is complete
     */
    Finished: boolean;
    /**
     * Represent the progress in percent of the process
     */
    Progress: number;
    /**
     * Represent the name of method to execute
     */
    Func: string;
    /**
     * Represent the name of the process to synchronize
     */
    Name: string;
    /**
     * Represent the information of the complete synchronization
     */
    Info: string;
}