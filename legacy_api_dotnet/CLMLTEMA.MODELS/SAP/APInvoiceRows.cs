using System.Collections.Generic;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
    /// <summary>
    /// Represents a row in the Purchase Invoice
    /// </summary>
    public class APInvoiceRows
    {
        /// <summary>
        /// Item code in sap
        /// </summary>
        public string ItemCode { get; set; }
        
        /// <summary>
        /// Item description or name
        /// </summary>
        public string ItemDescription { get; set; }
        
        /// <summary>
        /// Unit price of item
        /// </summary>
        public decimal UnitPrice { get; set; }
        
        /// <summary>
        /// Currency code used for this line
        /// </summary>
        public string Currency { get; set; }
        
        /// <summary>
        /// Item quantity.
        /// </summary>
        public decimal Quantity { get; set; }
        
        /// <summary>
        /// Item tax code
        /// </summary>
        public string TaxCode { get; set; }
        
        /// <summary>
        /// Item tax only flag (default value is "tNO")
        /// </summary>
        public string TaxOnly { get; set; } = "tNO";
        
        /// <summary>
        /// Item discount percentage
        /// </summary>
        public decimal DiscountPercent { get; set; }
        
        /// <summary>
        /// Item line number.
        /// </summary>
        public int LineNum { get; set; }
        
        /// <summary>
        /// Item line status.
        /// </summary>
        public string LineStatus { get; set; }
        
        /// <summary>
        /// Item tax rate.
        /// </summary>
        public decimal TaxRate { get; set; }
        
        /// <summary>
        /// Warehouse code where the item is located
        /// </summary>
        public string WarehouseCode { get; set; }
        
        /// <summary>
        /// Unit of measurement of the item
        /// </summary>
        public int UoMEntry { get; set; }
        
        /// <summary>
        /// Item Cost Code
        /// </summary>
        public string CostingCode { get; set; }
        
        /// <summary>
        /// List of user-defined fields (UDFs).
        /// </summary>
        public List<Udf> Udfs { get; set; }
        
        /// <summary>
        ///  List of master data units of measure
        /// </summary>
        public List<UoMMasterData> UoMMasterData { get; set; }
        
        /// <summary>
        /// Item base type (default value is -1)
        /// </summary>
        public int BaseType { get; set; } = -1;

        /// <summary>
        /// Item base entry (nullable).
        /// </summary>
        public int? BaseEntry { get; set; }
        /// <summary>
        /// Name warehouse of item
        /// </summary>
        public string WhsName { get; set; }
        
        /// <summary>
        /// Gets or sets VAT liability.
        /// </summary>
        public int VATLiable { get; set; }
    }
}