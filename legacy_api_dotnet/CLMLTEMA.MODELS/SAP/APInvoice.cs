using System;
using System.Collections.Generic;
using CL.STRUCTURES.ATTRIBUTES;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
    /// <summary>
    /// Represents a Purchase Invoice
    /// </summary>
    public class APInvoice : IDocument
    {
        /// <summary>
        /// Id of the document in Sap (master key)
        /// </summary>
        [MasterKey]
        public int DocEntry { get; set; }
        
        /// <summary>
        /// Document number
        /// </summary>
        public int DocNum { get; set; }
        
        /// <summary>
        /// Card code of the business partner for whom the document was created
        /// </summary>
        public string CardCode { get; set; }
        
        /// <summary>
        /// Card name of the business partner for whom the document 
        /// </summary>
        public string CardName { get; set; }
        
        /// <summary>
        /// Document currency.
        /// </summary>
        public string DocCurrency { get; set; }
        
        /// <summary>
        /// Date the document was created (default value is current date)
        /// </summary>
        public DateTime DocDate { get; set; } = DateTime.Now;
        
        /// <summary>
        /// Due date for the document (default value is current date)
        /// </summary>
        public DateTime DocDueDate { get; set; } = DateTime.Now;
        
        /// <summary>
        /// Tax date for the document
        /// </summary>
        public DateTime TaxDate { get; set; } = DateTime.Now;
        
        /// <summary>
        /// Document payment group code
        /// </summary>
        public int PaymentGroupCode { get; set; }
        
        /// <summary>
        /// Seller code
        /// </summary>
        public int SalesPersonCode { get; set; }
        
        /// <summary>
        /// Type of document (default value is dDocument_Items)
        /// </summary>
        public string DocType { get; set; } = "dDocument_Items";
        
        /// <summary>
        /// Additional comments on the document
        /// </summary>
        public string Comments { get; set; }
        
        /// <summary>
        /// Price list used to create the document
        /// </summary>
        public int PriceList { get; set; }
        
        /// <summary>
        /// Document Series
        /// </summary>
        public int Series { get; set; }
        
        /// <summary>
        /// List of lines in the document
        /// </summary>
        public List<APInvoiceRows> DocumentLines { get; set; }
        
        /// <summary>
        /// List of user-defined fields (UDFs)
        /// </summary>
        public List<Udf> Udfs { get; set; }
        
        /// <summary>
        /// Total document amount
        /// </summary>
        public decimal DocTotal { get; set; }
        
        /// <summary>
        /// Gets or sets the code representing the object of the document.
        /// </summary>
        public string DocObjectCode { get; set; }
        
        /// <summary>
        /// Gets or sets the entry for confirmation.
        /// </summary>
        public int ConfirmationEntry { get; set; }

        /// Represent the unique identifier of the document attachment
        /// </summary>
        public int? AttachmentEntry { get; set; }
        
        /// <summary>
        /// Represents or establishes tax withholding codes, but is not mandatory
        /// </summary>
        public List<WithholdingTaxCode> WithholdingTaxDataCollection { get; set; }
    }
    
    /// <summary>
    /// Model to create document with payment
    /// </summary>
    public class APInvoiceWithPayment
    {
        /// <summary>
        /// Model to invoice
        /// </summary>
        public APInvoice APInvoice { get; set; }
        
        /// <summary>
        /// Model to payment
        /// </summary>
        public IncomingPayment OutgoingPayment { get; set; }
    }
   
}