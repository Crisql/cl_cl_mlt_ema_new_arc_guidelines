using System;
using System.Collections.Generic;
using CL.STRUCTURES.ATTRIBUTES;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
    public class IncomingPayment
    {
        /// <summary>
        /// Internal document number
        /// </summary>
        [MasterKey] public int DocEntry { get; set; }
        
        /// <summary>
        ///  Document number
        /// </summary>
        public int DocNum { get; set; }
        
        /// <summary>
        ///  Business partner code
        /// </summary>
        public string CardCode { get; set; }
        
        /// <summary>
        ///  Business partner name
        /// </summary>
        public string CardName { get; set; }
        
        /// <summary>
        /// Document type
        /// </summary>
        public string DocType { get; set; }
        
        /// <summary>
        /// Document creation series
        /// </summary>
        public int Series { get; set; }
        
        /// <summary>
        /// Document Comments
        /// </summary>
        public string Remarks { get; set; }
        
        /// <summary>
        /// Document posting date
        /// </summary>
        public DateTime DocDate { get; set; } = DateTime.Now;
        
        /// <summary>
        /// Document creation date
        /// </summary>
        public DateTime TaxDate { get; set; } = DateTime.Now;
        
        /// <summary>
        /// Payment currency
        /// </summary>
        public string DocCurrency { get; set; }
        
        /// <summary>
        /// Exchange rate
        /// </summary>
        public decimal DocRate { get; set; }

        /// <summary>
        /// Cash payment financial account
        /// </summary>
        public string CashAccount { get; set; }
        
        /// <summary>
        /// Cash payment amount
        /// </summary>
        public decimal CashSum { get; set; }

        /// <summary>
        /// Transfer payment financial account
        /// </summary>
        public string TransferAccount { get; set; }
        
        /// <summary>
        /// Transfer payment amount
        /// </summary>
        public decimal TransferSum { get; set; }
        
        /// <summary>
        /// transfer payment date
        /// </summary>
        public DateTime? TransferDate { get; set; }
        
        /// <summary>
        /// transfer payment reference number
        /// </summary>
        public string TransferReference { get; set; }
        
        /// <summary>
        /// List of invoices to pay
        /// </summary>
        public List<PaymentInvoices> PaymentInvoices { get; set; }
        
        /// <summary>
        /// Payment card list
        /// </summary>
        public List<PaymentCreditCards> PaymentCreditCards { get; set; }
        
        /// <summary>
        /// List of transactions in the bank
        /// </summary>
        public List<PPTransaction> PPTransactions { get; set; }
        
        /// <summary>
        /// List of dynamic fields
        /// </summary>
        public List<Udf> Udfs { get; set; }  
        
    }
}