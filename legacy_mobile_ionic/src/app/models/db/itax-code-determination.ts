/**
 * Represents the structure of tax code determination settings in SAP Business One.
 * Tax code determination is used to define rules and conditions for automatically determining
 * tax codes for transactions based on various criteria.
 */
export interface ITaxCodeDetermination {
  /** The unique identifier for the document entry associated with the tax code determination. */
  DocEntry: number;

  /** The type of document for which the tax code determination is applied (e.g., sales order, purchase order). */
  DocType: string;

  /** The line number within the document to which the tax code determination applies. */
  LineNum: number;

  /** The business area associated with the tax code determination. */
  BusArea: number;

  /** Condition 1 used for tax code determination. */
  Cond1: number;

  /** User Defined Field (UDF) table associated with Condition 1. */
  UDFTable1: string;

  /** Numeric value used in Condition 1. */
  NumVal1: number;

  /** String value used in Condition 1. */
  StrVal1: string;

  /** Monetary value used in Condition 1. */
  MnyVal1: number;

  /** Alias for the user-defined field used in Condition 1. */
  UDFAlias1: string;

  /** Condition 2 used for tax code determination. */
  Cond2: number;

  /** User Defined Field (UDF) table associated with Condition 2. */
  UDFTable2: string;

  /** Numeric value used in Condition 2. */
  NumVal2: number;

  /** String value used in Condition 2. */
  StrVal2: string;

  /** Monetary value used in Condition 2. */
  MnyVal2: number;

  /** Alias for the user-defined field used in Condition 2. */
  UDFAlias2: string;

  /** Condition 3 used for tax code determination. */
  Cond3: number;

  /** User Defined Field (UDF) table associated with Condition 3. */
  UDFTable3: string;

  /** Numeric value used in Condition 3. */
  NumVal3: number;

  /** String value used in Condition 3. */
  StrVal3: string;

  /** Monetary value used in Condition 3. */
  MnyVal3: number;

  /** Alias for the user-defined field used in Condition 3. */
  UDFAlias3: string;

  /** Condition 4 used for tax code determination. */
  Cond4: number;

  /** User Defined Field (UDF) table associated with Condition 4. */
  UDFTable4: string;

  /** Numeric value used in Condition 4. */
  NumVal4: number;

  /** String value used in Condition 4. */
  StrVal4: string;

  /** Monetary value used in Condition 4. */
  MnyVal4: number;

  /** Alias for the user-defined field used in Condition 4. */
  UDFAlias4: string;

  /** Condition 5 used for tax code determination. */
  Cond5: number;

  /** User Defined Field (UDF) table associated with Condition 5. */
  UDFTable5: string;

  /** Numeric value used in Condition 5. */
  NumVal5: number;

  /** String value used in Condition 5. */
  StrVal5: string;

  /** Monetary value used in Condition 5. */
  MnyVal5: number;

  /** Alias for the user-defined field used in Condition 5. */
  UDFAlias5: string;

  /** The tax code associated with the document line. */
  LnTaxCode: string;

  /** Description or additional information about the tax code determination. */
  Descr: string;

  /** Flag indicating whether the tax code determination is applied at the line level. */
  FrLnTax: string;

  /** Flag indicating whether the tax code determination is applied at the header level. */
  FrHdrTax: string;
}

export interface MobileTaxCode{
  LnTaxCode:string;
}
