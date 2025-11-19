using System.Collections.Generic;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
    /// <summary>
    /// Represents a single row in a goods issue document, including item, pricing, warehouse, and allocation details.
    /// </summary>
    public class GoodsIssueRows
    {
        /// <summary>
        /// Gets or sets the unique code identifying the item.
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// Gets or sets the description of the item.
        /// </summary>
        public string ItemDescription { get; set; }

        /// <summary>
        /// Gets or sets the quantity of the item issued.
        /// </summary>
        public decimal Quantity { get; set; }

        /// <summary>
        /// Gets or sets the discount percentage applied to the item.
        /// </summary>
        public decimal DiscountPercent { get; set; }

        /// <summary>
        /// Gets or sets the warehouse code from which the item is issued.
        /// </summary>
        public string WarehouseCode { get; set; }

        /// <summary>
        /// Gets or sets the tax code applied to the item.
        /// </summary>
        public string TaxCode { get; set; }

        /// <summary>
        /// Gets or sets the unit of measure entry ID.
        /// </summary>
        public int UoMEntry { get; set; }

        /// <summary>
        /// Gets or sets the costing code related to the item.
        /// </summary>
        public string CostingCode { get; set; }

        /// <summary>
        /// Gets or sets the currency used for the transaction.
        /// </summary>
        public string Currency { get; set; }

        /// <summary>
        /// Gets or sets the list of user-defined fields (UDFs) associated with this line.
        /// </summary>
        public List<Udf> Udfs { get; set; }

        /// <summary>
        /// Gets or sets the unit price of the item.
        /// </summary>
        public decimal UnitPrice { get; set; }

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