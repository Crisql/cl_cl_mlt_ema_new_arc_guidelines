using System;
using System.Collections.Generic;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// This class is used to mapping result data to print 
    /// </summary>
    public class PaymentReceivedDocument
    {
        /// <summary>
        /// Pather code
        /// </summary>
        public string CardCode { get; set; }
        /// <summary>
        /// Pather name
        /// </summary>
        public string CardName { get; set; }
        /// <summary>
        /// Cash sum
        /// </summary>
        public decimal CashSum { get; set; }
        /// <summary>
        /// Transfer sum
        /// </summary>
        public decimal TransferSum { get; set; }
        /// <summary>
        /// Credit Sum
        /// </summary>
        public decimal CreditSum { get; set; }
        /// <summary>
        /// Total document pay
        /// </summary>
        public decimal DocTotal { get; set; }
        /// <summary>
        /// Total document invoice
        /// </summary>
        public decimal DocTotalInv { get; set; }
        /// <summary>
        /// Document data
        /// </summary>
        public DateTime DocDate { get; set; }
        /// <summary>
        /// Internal number invoice
        /// </summary>
        public int DocNumInv { get; set; }
        /// <summary>
        /// Internal number payment
        /// </summary>
        public int DocNumPay { get; set; }
        /// <summary>
        /// Document currency payment
        /// </summary>
        public string DocCurrency { get; set; }
        /// <summary>
        /// Document currency invoices
        /// </summary>
        public string DocCurrencyInv { get; set; }
        /// <summary>
        /// Phone
        /// </summary>
        public string Phone1 { get; set; }
        /// <summary>
        /// Business partner email 
        /// </summary>
        public string E_Mail { get; set; }
    }

    /// <summary>
    /// This class is used to mapping of format to print mobile
    /// </summary>
    public class FormatDocument
    {
        /// <summary>
        /// Print format
        /// </summary>
        public string PrintFormat { get; set; }
    }

    /// <summary>
    /// This lass is used to print format in mobile
    /// </summary>
    public class PaymentReceivedPrint : PaymentReceivedDocument
    {
        /// <summary>
        /// Id user
        /// </summary>
        public int UserId { get; set; }
        /// <summary>
        /// Id company
        /// </summary>
        public int CompanyId { get; set; }
        /// <summary>
        /// Documents canceled with payment
        /// </summary>
        public string PaymentInvoices { get; set; }
        
        /// <summary>
        /// Direction of the company
        /// </summary>
        public string CompanyDirection { get; set; }
        
        /// <summary>
        /// Identification of the company
        /// </summary>
        public string CompanyIdentification { get; set; }
        
        /// <summary>
        /// Company name
        /// </summary>
        public string  CompanyName { get; set; }
        
        /// <summary>
        /// Company phone
        /// </summary>
        public string CompanyPhone { get; set; }
    }

    /// <summary>
    /// This class document canceled with payment
    /// </summary>
    public class PrintPaymentInvoice
    {
        /// <summary>
        /// Document number
        /// </summary>
        public int DocNum { get; set; }
        /// <summary>
        /// Document total
        /// </summary>
        public decimal DocTotal { get; set; }
    }
}