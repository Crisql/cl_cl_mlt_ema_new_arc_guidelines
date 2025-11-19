/**
 * Class is used to map the payment terms model
 */
export interface IPayTerms {
  /**
   * Identifier for payment terms
   */
  GroupNum: number;
  /**
   * Group for payment terms
   */
  PymntGroup: string;
  /**
   * type for payment terms
   */
  Type: number;
  /**
   * Months in which payment terms are specified
   */
  Months: number;
  /**
   * Days on which payment terms are finalized
   */
  Days: number;
}
