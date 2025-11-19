/**
 * Represents the model for tax withholding configured in SAP.
 */
export interface IWithholdingTax {
  /**
   * Unique code identifying the tax withholding.
   */
  WTCode: string;

  /**
   * Name or description of the tax withholding.
   */
  WTName: string;

  /**
   * Tax withholding rate as a percentage.
   */
  Rate: number;

  /**
   * Category of the tax withholding.
   */
  Category: string;

  /**
   * Type of base amount used for tax withholding calculation.
   */
  BaseType: string;

  /**
   * Percentage applied to the base amount.
   */
  PrctBsAmnt: number;

  /**
   * Official code associated with the tax withholding.
   */
  OffclCode: string;

  /**
   * General ledger account linked to the tax withholding.
   */
  Account: string;

  /**
   * Define the type of withholding
   */
  WithholdingType: string;

  /**
   * Indicates whether the tax withholding is inactive (`'Y'` for inactive, `'N'` for active).
   */
  Inactive: string;

  /**
   * identifier for handling drop-down options
   */
  IdDiffBy: number;

   /**
   * Otras propiedades dinámicas.
   */
   [key: string]: any;
}

/**
 * Represents a selected tax withholding.
 */
export interface IWithholdingTaxSelected  {
  /**
   * Indicates whether the tax withholding is selected.
   */
  Selected: boolean;

  /**
   * Unique code identifying the tax withholding.
   */
  WTCode: string;

  /**
   * Name or description of the tax withholding.
   */
  WTName: string;

  /**
   * Base type used for calculating the withholding tax.
   */
  BaseType: string;

  /**
   * Tax withholding rate as a percentage.
   */
  Rate: number;

  /**
   * Percentage applied to the base amount.
   */
  PrctBsAmnt: number;

   /**
   * identifier for handling drop-down options
   */
   IdDiffBy: number;

   /**
   * Define the type of withholding
   */
   WithholdingType: string;

   /**
   * Otras propiedades dinámicas.
   */
  [key: string]: any;
}
