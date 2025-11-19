using System;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// This class is used to mapping model of the document order,quotations, invoices
    /// </summary>
    public class DocumentToPrint
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
        /// Document currency
        /// </summary>
        public string DocCurrency { get; set; }
        /// <summary>
        /// Identification
        /// </summary>
        public string FederalTaxID { get; set; }
        /// <summary>
        /// Phone
        /// </summary>
        public string Phone { get; set; }
        /// <summary>
        /// Document number
        /// </summary>
        public int DocNum { get; set; }
        /// <summary>
        /// FE number
        /// </summary>
        public string NumFE { get; set; }
        /// <summary>
        /// FE clave
        /// </summary>
        public string ClaveFE { get; set; }
        /// <summary>
        /// Document date
        /// </summary>
        public DateTime DocDate { get; set; }
        /// <summary>
        /// Sales person
        /// </summary>
        public string SalesPerson { get; set; }
        /// <summary>
        /// Item Name
        /// </summary>
        public string ItemName { get; set; }
        /// <summary>
        /// Taxes
        /// </summary>
        public decimal Tax { get; set; }
        /// <summary>
        /// Doc Total
        /// </summary>
        public decimal DocTotal { get; set; }
        /// <summary>
        /// Quantity
        /// </summary>
        public decimal Quantity { get; set; }
        /// <summary>
        /// Discount percent
        /// </summary>
        public decimal DiscountPercent { get; set; }
        /// <summary>
        /// Tax percent row
        /// </summary>
        public decimal TaxRate { get; set; }
        /// <summary>
        /// Unit price
        /// </summary>
        public decimal UnitPrice { get; set; }
        /// <summary>
        /// Discount total
        /// </summary>
        public decimal Discount { get; set; }
        /// <summary>
        /// Currency row
        /// </summary>
        public string Currency { get; set; }
        /// <summary>
        /// Line Total
        /// </summary>
        public decimal LineTotal { get; set; }
        
        /// <summary>
        /// Email of BP
        /// </summary>
        public string EmailAddress { get; set; }
        
    }

    /// <summary>
    /// This class is used to mapping model of the document lines order,quotations, invoices
    /// </summary>
    public class DocumentLinesToPrint
    {
        /// <summary>
        /// Item Name
        /// </summary>
        public string ItemName { get; set; }
        /// <summary>
        /// Quantity
        /// </summary>
        public decimal Quantity { get; set; }
        /// <summary>
        /// Discount percent
        /// </summary>
        public decimal DiscountPercent { get; set; }
        /// <summary>
        /// Tax percent row
        /// </summary>
        public decimal TaxRate { get; set; }
        /// <summary>
        /// Unit price
        /// </summary>
        public decimal UnitPrice { get; set; }
        /// <summary>
        /// Currency row
        /// </summary>
        public string Currency { get; set; }
        /// <summary>
        /// Line Total
        /// </summary>
        public decimal LineTotal { get; set; }
    }

    /// <summary>
    /// This class is used data to print in the ZPL
    /// </summary>
    public class DocumentToPrintZPL
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
        /// Clave FE
        /// </summary>
        public string Clave { get; set; }
        /// <summary>
        /// Company id
        /// </summary>
        public int CompanyId { get; set; }
        /// <summary>
        /// Discount total
        /// </summary>
        public decimal Discount { get; set; }
        /// <summary>
        /// Document currency
        /// </summary>
        public string DocCurrency { get; set; }
        /// <summary>
        /// Document date
        /// </summary>
        public DateTime DocDate { get; set; }
        /// <summary>
        /// Document number
        /// </summary>
        public int DocNum { get; set; }
        /// <summary>
        /// Doc Total
        /// </summary>
        public decimal DocTotal { get; set; }
        /// <summary>
        /// Document Lines
        /// </summary>
        public string DocumentLines { get; set; }
        /// <summary>
        /// Document type
        /// </summary>
        public int DocumentType { get; set; }
        /// <summary>
        /// Identification
        /// </summary>
        public string FederalTaxID { get; set; }
        /// <summary>
        /// Payment total
        /// </summary>
        public decimal PayTotal { get; set; }
        /// <summary>
        /// Phone
        /// </summary>
        public string Phone { get; set; }
        /// <summary>
        /// Doc Total
        /// </summary>
        public decimal SubTotal { get; set; }
        /// <summary>
        /// Sales person
        /// </summary>
        public string SalesPerson { get; set; }
        /// <summary>
        /// Taxes
        /// </summary>
        public decimal Tax { get; set; }
        /// <summary>
        /// User Id
        /// </summary>
        public int UserId { get; set; }
        
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
        
        /// <summary>
        /// FE number
        /// </summary>
        public string NumFE { get; set; }
        
        /// <summary>
        /// Email of BP
        /// </summary>
        public string EmailAddress { get; set; }
    }
}