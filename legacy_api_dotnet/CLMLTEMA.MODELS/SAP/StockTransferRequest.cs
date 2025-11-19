using System;
using System.Collections.Generic;
using CL.STRUCTURES.ATTRIBUTES;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
    public class StockTransferRequest
    {
        [MasterKey]
        public int DocEntry { get; set; }
        public int DocNum { get; set; }
        public DateTime DocDate { get; set; } = DateTime.Now;
        public DateTime DueDate { get; set; } = DateTime.Now;
        public string Comments { get; set; }
        public int SalesPersonCode { get; set; }
        public string FromWarehouse { get; set; }
        public string ToWarehouse { get; set; }
        public string DocStatus { get; set; }
        public List<StockTransferRequestRows> StockTransferLines { get; set; }
        public List<Udf> Udfs { get; set; }
        
        /// <summary>
        /// Gets or sets the date of the invoice.
        /// </summary>
        public DateTime TaxDate { get; set; } = DateTime.Now;
        
        /// <summary>
        /// Represent the unique identifier of the document attachment
        /// </summary>
        public int? AttachmentEntry { get; set; }
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
    /// Represents a draft of a stock transfer request.
    /// </summary>
    public class StockTransferRequestDraft
    {
        /// <summary>
        /// Gets or sets the document entry identifier.
        /// </summary>
        [MasterKey]
        public int DocEntry { get; set; }

        /// <summary>
        /// Gets or sets the document number.
        /// </summary>
        public int DocNum { get; set; }

        /// <summary>
        /// Gets or sets the document date.
        /// </summary>
        public DateTime DocDate { get; set; } = DateTime.Now;

        /// <summary>
        /// Gets or sets the due date of the document.
        /// </summary>
        public DateTime DueDate { get; set; } = DateTime.Now;

        /// <summary>
        /// Gets or sets the comments associated with the document.
        /// </summary>
        public string Comments { get; set; }

        /// <summary>
        /// Gets or sets the sales person code.
        /// </summary>
        public int SalesPersonCode { get; set; }

        /// <summary>
        /// Gets or sets the filler warehouse code.
        /// </summary>
        public string Filler { get; set; }

        /// <summary>
        /// Gets or sets the destination warehouse code.
        /// </summary>
        public string ToWhsCode { get; set; }

        /// <summary>
        /// Gets or sets the document status.
        /// </summary>
        public string DocStatus { get; set; }

        /// <summary>
        /// Gets or sets the list of document lines.
        /// </summary>
        public List<StockTransferRequestRows> DocumentLines { get; set; }

        /// <summary>
        /// Gets or sets the list of user-defined fields.
        /// </summary>
        public List<Udf> Udfs { get; set; }

        /// <summary>
        /// Gets or sets the date of the invoice.
        /// </summary>
        public DateTime TaxDate { get; set; } = DateTime.Now;

        /// <summary>
        /// Represents the unique identifier of the document attachment.
        /// </summary>
        public int? AttachmentEntry { get; set; }

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