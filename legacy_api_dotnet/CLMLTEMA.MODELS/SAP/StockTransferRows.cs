using System.Collections.Generic;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
    /// <summary>
    /// Represents a line item in a stock transfer document, including item details,
    /// source and destination warehouses, and tracking information such as serials, batches, and bin allocations.
    /// </summary>
    public class StockTransferRows
    {
        /// <summary>
        /// Gets or sets the item code of the product being transferred.
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// Gets or sets the description of the item.
        /// </summary>
        public string ItemDescription { get; set; }

        /// <summary>
        /// Gets or sets the quantity of the item being transferred.
        /// </summary>
        public decimal Quantity { get; set; }

        /// <summary>
        /// Gets or sets the destination warehouse code.
        /// </summary>
        public string WarehouseCode { get; set; }

        /// <summary>
        /// Gets or sets the source warehouse code for the item.
        /// </summary>
        public string FromWarehouseCode { get; set; }

        /// <summary>
        /// Gets or sets the base line number of the source document, if applicable.
        /// </summary>
        public int? BaseLine { get; set; }

        /// <summary>
        /// Gets or sets the base document entry number from which this line originates, if applicable.
        /// </summary>
        public int? BaseEntry { get; set; }

        /// <summary>
        /// Gets or sets the base document type code.
        /// </summary>
        public string BaseType { get; set; }

        /// <summary>
        /// Gets or sets the list of serial numbers associated with the item.
        /// </summary>
        public List<StockTransfersSerialsNumbers> SerialNumbers { get; set; }

        /// <summary>
        /// Gets or sets the list of batch numbers associated with the item.
        /// </summary>
        public List<BatchNumbers> BatchNumbers { get; set; }

        /// <summary>
        /// Gets or sets the list of bin allocations for the item in the stock transfer.
        /// </summary>
        public List<StockTransferLinesBinAllocations> StockTransferLinesBinAllocations { get; set; }

        /// <summary>
        /// Gets or sets the list of user-defined fields (UDFs) for the line item.
        /// </summary>
        public List<Udf> Udfs { get; set; }

        /// <summary>
        /// Gets or sets the current status of the line (e.g., Open, Closed).
        /// </summary>
        public string LineStatus { get; set; }
    }

    /// <summary>
    /// Represents a row in a stock transfer document.
    /// </summary>
    public class StockTransfersRows
    {
        /// <summary>
        /// Gets or sets the code of the item.
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// Gets or sets the description of the item.
        /// </summary>
        public string ItemDescription { get; set; }

        /// <summary>
        /// Gets or sets the quantity of the item to be transferred.
        /// </summary>
        public decimal Quantity { get; set; }

        /// <summary>
        /// Gets or sets the code of the warehouse where the item is to be transferred.
        /// </summary>
        public string WarehouseCode { get; set; }

        /// <summary>
        /// Gets or sets the code of the warehouse from where the item is being transferred.
        /// </summary>
        public string FromWarehouseCode { get; set; }

        /// <summary>
        /// Gets or sets the base line number of the document.
        /// Default value is -1.
        /// </summary>
        public int? BaseLine { get; set; }

        /// <summary>
        /// Gets or sets the base entry number of the document.
        /// </summary>
        public int? BaseEntry { get; set; }

        /// <summary>
        /// Gets or sets the base type of the document.
        /// </summary>
        public string BaseType { get; set; } 

        /// <summary>
        /// Gets or sets the list of serial numbers associated with the stock transfer.
        /// </summary>
        public List<StockTransfersSerialsNumbers> SerialNumbers { get; set; }

        /// <summary>
        /// Gets or sets the list of batch numbers associated with the stock transfer.
        /// </summary>
        public List<BatchNumbers> BatchNumbers { get; set; }

        /// <summary>
        /// Gets or sets the list of bin allocations for the document lines.
        /// </summary>
        public List<StockTransferDraftLinesBinAllocations> DocumentLinesBinAllocations { get; set; }

        /// <summary>
        /// Gets or sets the list of user-defined fields associated with the stock transfer.
        /// </summary>
        public List<Udf> Udfs { get; set; }

        /// <summary>
        /// Gets or sets the status of the line.
        /// </summary>
        public string LineStatus { get; set; }
    }
}