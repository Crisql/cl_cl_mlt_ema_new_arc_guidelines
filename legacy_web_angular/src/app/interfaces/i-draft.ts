import {IDocumentLine} from "@app/interfaces/i-items";
import {IUdf} from "@app/interfaces/i-udf";

export interface IDraft {

  /**
   * Document number
   */
  DocNum: number;

  /**
   * Card code of the business partner for whom the document was created
   */
  CardCode: string

  /**
   * Card name of the business partner for whom the document
   */
  CardName: string

  /**
   * Document currency.
   */
  DocCurrency: string

  /**
   * Date the document was created (default value is current date)
   */
  DocDate: string

  /**
   * Due date for the document (default value is current date)
   */
  DocDueDate: string;

  /**
   * Document payment group code
   */
  PaymentGroupCode: number

  /**
   * Seller code
   */
  SalesPersonCode: number

  /**
   * Type of document (default value is dDocument_Items)
   */
  DocType: string

  /**
   * Additional comments on the document
   */
  Comments: string

  /**
   * Price list used to create the document
   */
  PriceList: number

  /**
   * Document Series
   */
  Series: number

  /**
   * List of lines in the document
   */
  DocumentLines: IDocumentLine[];

  /**
   * List of user-defined fields (UDFs)
   */
  Udfs: IUdf[]

  /**
   * Total document amount
   */
  DocTotal: number

  /**
   * Type document preliminary
   */
  ObjType : string


  /**
   * Document status for approval
   */
 Approval_Status: string
}
