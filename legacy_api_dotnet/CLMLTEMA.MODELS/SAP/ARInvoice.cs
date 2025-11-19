using System;
using System.Collections.Generic;
using CL.STRUCTURES.ATTRIBUTES;
using CL.STRUCTURES.CLASSES.Udf;
using Newtonsoft.Json;

namespace CLMLTEMA.MODELS.SAP
{
    /// <summary>
    /// Model represent invoice docuement 
    /// </summary>
    /// <summary>
    /// Represents an SAP Business One invoice document.
    /// </summary>
    public class ARInvoice : SalesDocument
    {
        /// <summary>
        /// Gets or sets the exchange rate for the document currency.
        /// </summary>
        public decimal DocRate { get; set; }

        /// <summary>
        /// Gets or sets the indicator for reserving the invoice. Defaults to "tNO".
        /// </summary>
        public string ReserveInvoice { get; set; } = "tNO";

        /// <summary>
        /// Gets or sets the identifier for redemption transactions.
        /// </summary>
        public string IdTranRedimir { get; set; }

        /// <summary>
        /// Gets or sets the identifier for accumulating transactions.
        /// </summary>
        public string IdTranAcumular { get; set; }

        /// <summary>
        /// Gets or sets the number assigned to the invoice.
        /// </summary>
        public string InvoiceNumber { get; set; }

        /// <summary>
        /// Gets or sets the number of the fiscal document associated with the invoice.
        /// </summary>
        public string NumFE { get; set; }

        /// <summary>
        /// Gets or sets the fiscal key associated with the fiscal document.
        /// </summary>
        public string ClaveFE { get; set; }

        /// <summary>
        /// Gets or sets the list of down payments to draw represented by the DownPaymentsToDraw class.
        /// </summary>
        public List<DownPaymentsToDraw> DownPaymentsToDraw { get; set; }

        /// <summary>
        /// Gets or sets the key associated with the document.
        /// </summary>
        public string DocumentKey { get; set; }

        /// <summary>
        /// Gets or sets the indicator for transactions with Tapp.
        /// </summary>
        public bool WithTransactionTapp { get; set; }

        /// <summary>
        /// Gets or sets the total amount in foreign currency.
        /// </summary>
        public decimal DocTotalFC { get; set; }
    }

    

    /// <summary>
    /// Represents down payments to draw associated with an SAP Business One invoice.
    /// </summary>
    public class DownPaymentsToDraw
    {
        /// <summary>
        /// Gets or sets the unique identifier for the document.
        /// </summary>
        public int DocEntry { get; set; }

        /// <summary>
        /// Gets or sets the type of down payment.
        /// </summary>
        public string DownPaymentType { get; set; }
        
        /// <summary>
        /// Gets or sets the balance with taxes extracted from the invoice line.
        /// </summary>
        public decimal GrossAmountToDraw { get; set; }
        
        /// <summary>
        /// Gets or sets the balance with taxes extracted from the foreign currency invoice line.
        /// </summary>
        public decimal GrossAmountToDrawFC { get; set; }
    }

}