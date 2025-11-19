/**
 * Represent the a special permission that will be applied to the user
 */
export interface IGeoConfig {
    /**
     * The database id of the geo configuration
     */
    Id: number;
    /**
     * The display name of the geo configuration
     */
    Name: string;
    /**
     * The key of the geo configuration. Used in the application
     */
    Key: number;
}