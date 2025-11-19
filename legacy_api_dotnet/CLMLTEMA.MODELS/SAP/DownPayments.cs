using System;
using System.Collections.Generic;
using CL.STRUCTURES.ATTRIBUTES;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
    public class DownPayments : SalesDocument
    {
        /// <summary>
        /// Exchange rate
        /// </summary>
        public decimal DocRate { get; set; }
        
        /// <summary>
        /// Payment document type
        /// </summary>
        public string DownPaymentType { get; set; }
        
        /// <summary>
        /// Document Percentage
        /// </summary>
        public decimal DownPaymentPercentage { get; set; } 
        
        /// <summary>
        /// bill number
        /// </summary>
        public string InvoiceNumber { get; set; }
    }
    
    public class DownPaymentRows : SalesDocumentLine
    {
        /// <summary>
        /// Name warehouse of item
        /// </summary>
        public string WhsName { get; set; }
    }
    
    public class AdvanceInvoiceWithPayment
    {
        public DownPayments ARInvoice { get; set; }
        public IncomingPayment IncomingPayment { get; set; }
    }
    
    public class AppliedDownPayment
    {
        [MasterKey] public int DocEntry { get; set; }
        public int DocNum { get; set; }
        public string CardCode { get; set; }
        public string CardName { get; set; }
        public DateTime DocDate { get; set; }
        public decimal DocTotal { get; set; }
        public decimal Saldo { get; set; }
        public string DocCurrency { get; set; }
        public decimal VatSum { get; set; } 
        
    }
    
    /// <summary>
    /// Represent model to create purchase down payment
    /// </summary>
    public class AdvancePurchaseInvoiceWithPayment
    {
        public DownPayments APInvoice { get; set; }
        public IncomingPayment OutgoingPayment { get; set; }
    }
}