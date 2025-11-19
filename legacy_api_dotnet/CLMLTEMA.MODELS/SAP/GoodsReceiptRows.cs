using System.Collections.Generic;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
    /// <summary>
    /// Represents a line item within a goods receipt document.
    /// </summary>
    public class GoodsReceiptRows
    {
        /// <summary>
        /// Gets or sets the unique item code (SKU).
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// Gets or sets the human-readable description of the item.
        /// </summary>
        public string ItemDescription { get; set; }

        /// <summary>
        /// Gets or sets the quantity of the item being received.
        /// </summary>
        public decimal Quantity { get; set; }

        /// <summary>
        /// Gets or sets the discount percentage applied to the item.
        /// </summary>
        public decimal DiscountPercent { get; set; }

        /// <summary>
        /// Gets or sets the warehouse code where the item will be stored.
        /// </summary>
        public string WarehouseCode { get; set; }

        /// <summary>
        /// Gets or sets the unit price of the item.
        /// </summary>
        public decimal UnitPrice { get; set; }

        /// <summary>
        /// Gets or sets the tax code applicable to the item.
        /// </summary>
        public string TaxCode { get; set; }

        /// <summary>
        /// Indicates whether the line is for tax-only purposes.
        /// Default is "tNO".
        /// </summary>
        public string TaxOnly { get; set; } = "tNO";

        /// <summary>
        /// Gets or sets the unit of measure entry identifier.
        /// </summary>
        public int UoMEntry { get; set; }

        /// <summary>
        /// Gets or sets the costing code used for cost center allocation.
        /// </summary>
        public string CostingCode { get; set; }

        /// <summary>
        /// Gets or sets the account code associated with the transaction.
        /// </summary>
        public string AccountCode { get; set; }

        /// <summary>
        /// Gets or sets the currency used for this line item.
        /// </summary>
        public string Currency { get; set; }

        /// <summary>
        /// Gets or sets the list of user-defined fields associated with this item line.
        /// </summary>
        public List<Udf> Udfs { get; set; }

        /// <summary>
        /// Gets or sets the list of batch numbers associated with this line, if applicable.
        /// </summary>
        public List<BatchNumbers> BatchNumbers { get; set; }

        /// <summary>
        /// Gets or sets the list of serial numbers associated with this line, if applicable.
        /// </summary>
        public List<SerialNumbers> SerialNumbers { get; set; }

        /// <summary>
        /// Gets or sets the bin allocations for this line, if applicable.
        /// </summary>
        public List<DocumentLinesBinAllocations> DocumentLinesBinAllocations { get; set; }
    }
}