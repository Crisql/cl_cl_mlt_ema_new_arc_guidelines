/**
 * Represent the details of the blanket agreements
 */
export interface IBlanketAgreementLine {
  /**
   * Blanket agreement unique identifier
   */
  AbsID: number;
  /**
   * The item where this blanket agreement should be applied
   */
  ItemCode: string;
  /**
   * Item group of the item where this blanket agreement should be applied
   */
  ItemGroup: string;
  /**
   * Item price defined by blanket agreement
   */
  UnitPrice: number;
  /**
   * Currency of the item price defined by blanket agreement
   */
  Currency: string;
  /**
   * Required quantity of the ite, to apply the blanket agreement
   */
  PlanQty: number;
  /**
   * Indicates if a discount from discount hierarchies was applied
   */
  HasDiscountApplied?: boolean;
}
