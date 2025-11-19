/**
 * Represent a currency used to made payments and documents
 */
export interface ICurrency 
{
    /**
     * Currency code like (USD | COL)
     */
    Id: string;
    /**
     * Currency name like (Colones | Dolares)
     */
    Name: string;
    /**
     * The symbol of the currency. Like ($)
     */
    Symbol: string;
    /**
     * Indicates if this is the local currency
     */
    IsLocal: boolean;
}