using System;
using System.Collections.Generic;
using CL.STRUCTURES.ATTRIBUTES;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
    /// <summary>
    /// Represents a stock transfer document, including header details and related line items.
    /// </summary>
    public class StockTransfer
    {
        /// <summary>
        /// Gets or sets the unique document entry identifier (primary key).
        /// </summary>
        [MasterKey]
        public int DocEntry { get; set; }

        /// <summary>
        /// Gets or sets the document number.
        /// </summary>
        public int DocNum { get; set; }

        /// <summary>
        /// Gets or sets the comments associated with the stock transfer.
        /// </summary>
        public string Comments { get; set; }

        /// <summary>
        /// Gets or sets the salesperson code associated with the transfer.
        /// </summary>
        public int SalesPersonCode { get; set; }

        /// <summary>
        /// Gets or sets the document date.
        /// </summary>
        public DateTime DocDate { get; set; }

        /// <summary>
        /// Gets or sets the due date of the transfer. Defaults to the current date.
        /// </summary>
        public DateTime DueDate { get; set; } = DateTime.Now;

        /// <summary>
        /// Gets or sets the source warehouse code.
        /// </summary>
        public string FromWarehouse { get; set; }

        /// <summary>
        /// Gets or sets the destination warehouse code.
        /// </summary>
        public string ToWarehouse { get; set; }

        /// <summary>
        /// Gets or sets the list of line items associated with the stock transfer.
        /// </summary>
        public List<StockTransferRows> StockTransferLines { get; set; }

        /// <summary>
        /// Gets or sets the list of user-defined fields (UDFs) associated with the transfer.
        /// </summary>
        public List<Udf> Udfs { get; set; }

        /// <summary>
        /// Gets or sets the unique identifier of the document attachment.
        /// </summary>
        public int? AttachmentEntry { get; set; }

        /// <summary>
        /// Gets or sets the tax date for the stock transfer.
        /// </summary>
        public DateTime TaxDate { get; set; }

        /// <summary>
        /// Gets or sets the confirmation entry number.
        /// </summary>
        public int ConfirmationEntry { get; set; }

        /// <summary>
        /// Gets or sets the document object code.
        /// </summary>
        public string DocObjectCode { get; set; }

        /// <summary>
        /// Gets or sets the code representing the series of the document.
        /// </summary>
        public int Series { get; set; }
    }

    /// <summary>
    /// Represents a draft of a stock transfer document.
    /// </summary>
    public class StockTransferDraft {
        /// <summary>
        /// Gets or sets the unique identifier for the document.
        /// </summary>
        [MasterKey]public int DocEntry { get; set; }

        /// <summary>
        /// Gets or sets the document number.
        /// </summary>
        public int DocNum { get; set; }

        /// <summary>
        /// Gets or sets the comments associated with the document.
        /// </summary>
        public string Comments { get; set; }

        /// <summary>
        /// Gets or sets the code of the salesperson associated with the document.
        /// </summary>
        public int SalesPersonCode { get; set; }

        /// <summary>
        /// Gets or sets the date of the document.
        /// </summary>
        public DateTime DocDate { get; set; }

        /// <summary>
        /// Gets or sets the due date of the document. Defaults to the current date.
        /// </summary>
        public DateTime DueDate { get; set; } = DateTime.Now;

        /// <summary>
        /// Gets or sets the warehouse from which the stock is transferred, is equivalent to FromWarehouse in model standard.
        /// </summary>
        public string Filler { get; set; }

        /// <summary>
        /// Gets or sets the warehouse to which the stock is transferred, is equivalent to ToWarehouse in model standard.
        /// </summary>
        public string ToWhsCode { get; set; }

        /// <summary>
        /// Gets or sets the list of document lines associated with the stock transfer.
        /// </summary>
        public List<StockTransfersRows> DocumentLines { get; set; }

        /// <summary>
        /// Gets or sets the list of user-defined fields associated with the document.
        /// </summary>
        public List<Udf> Udfs { get; set; }

        /// <summary>
        /// Represents the unique identifier of the document attachment.
        /// </summary>
        public int? AttachmentEntry { get; set; }

        /// <summary>
        /// Gets or sets the date of the invoice.
        /// </summary>
        public DateTime TaxDate { get; set; }

        /// <summary>
        /// Gets or sets the confirmation entry number.
        /// </summary>
        public int ConfirmationEntry { get; set; }

        /// <summary>
        /// Gets or sets the document object code.
        /// </summary>
        public string DocObjectCode { get; set; }
    }
}