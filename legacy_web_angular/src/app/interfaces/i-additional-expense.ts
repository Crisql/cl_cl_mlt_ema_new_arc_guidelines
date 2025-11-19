export interface IAdditionalExpense {
    /**
   * Code reference to the expense
   */
  ExpenseCode: number;

  /**
   * Total applied on expense
   */
  LineTotal: number;

  /**
   * TotalFC applied on expense
   */
  LineTotalFC: number;

  /**
   * TaxCode Expense define
   */
  TaxCode: string;
}
