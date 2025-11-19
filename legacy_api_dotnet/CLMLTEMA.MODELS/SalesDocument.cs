using System;
using System.Collections.Generic;
using CL.STRUCTURES.ATTRIBUTES;
using CLMLTEMA.MODELS.SAP;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represent the base model of a sales document on SAP
    /// </summary>
    public class SalesDocument : IDocument
    {
        /// <summary>
        /// Gets or sets the unique identifier for the document. Used as a master key.
        /// </summary>
        [MasterKey]
        public int DocEntry { get; set; }
        
        /// <summary>
        /// Gets or sets the document number assigned to the invoice.
        /// </summary>
        public int DocNum { get; set; }
        
        /// <summary>
        /// Gets or sets the list of user-defined fields represented by the Udf class.
        /// </summary>
        public List<CL.STRUCTURES.CLASSES.Udf.Udf> Udfs { get; set; }
        
        /// <summary>
        /// Gets or sets the code representing the object of the document.
        /// </summary>
        public string DocObjectCode { get; set; }
        
        /// <summary>
        /// Gets or sets the code of the business partner or customer associated with the invoice.
        /// </summary>
        public string CardCode { get; set; }
        
        /// <summary>
        /// Gets or sets the name of the business partner or customer associated with the invoice.
        /// </summary>
        public string CardName { get; set; }
        
        /// <summary>
        /// Document posting date
        /// </summary>
        public DateTime DocDate { get; set; } = DateTime.Now;
        
        /// <summary>
        /// Document expiration date
        /// </summary>
        public DateTime DocDueDate { get; set; } = DateTime.Now;
        
        /// <summary>
        /// Document creation date
        /// </summary>
        public DateTime TaxDate { get; set; } = DateTime.Now;
        
        /// <summary>
        /// Gets or sets additional comments or remarks for the invoice.
        /// </summary>
        public string Comments { get; set; }
        
        /// <summary>
        /// Gets or sets the code of the salesperson associated with the invoice.
        /// </summary>
        public int SalesPersonCode { get; set; }
        
        /// <summary>
        /// Gets or sets the total amount of the invoice.
        /// </summary>
        public decimal DocTotal { get; set; }
        
        /// <summary>
        /// Gets or sets the code representing the series of the invoice.
        /// </summary>
        public int Series { get; set; }
        
        /// <summary>
        /// Gets or sets the currency code of the document.
        /// </summary>
        public string DocCurrency { get; set; }
        
        /// <summary>
        /// Gets or sets the status of the document.
        /// </summary>
        public string DocStatus { get; set; }
        
        /// <summary>
        /// Represent the unique identifier of the document attachment
        /// </summary>
        public int? AttachmentEntry { get; set; }
        
        /// <summary>
        /// Gets or sets the entry for confirmation.
        /// </summary>
        public int ConfirmationEntry { get; set; }
        
        /// <summary>
        /// Gets or sets the code representing the payment group associated with the invoice.
        /// </summary>
        public int PaymentGroupCode { get; set; }
        
        /// <summary>
        /// Gets or sets the code representing the price list associated with the invoice.
        /// </summary>
        public int PriceList { get; set; }
        
        /// <summary>
        /// Gets or sets the code of the sales person name associated with the invoice.
        /// </summary>
        public string SalesPersonName { get; set; }
        
        /// <summary>
        /// Gets or sets the type of electronic document.
        /// </summary>
        public string TipoDocE { get; set; }
        
        /// <summary>
        /// Gets or sets the identification information for the business partner or customer.
        /// </summary>
        public string Identification { get; set; }
        
        /// <summary>
        /// Gets or sets the email address associated with the document.
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Gets or sets the identifier type for the business partner or customer.
        /// </summary>
        public string IdType { get; set; }
        
        /// <summary>
        /// Represent the items of the document
        /// </summary>
        public List<SalesDocumentLine> DocumentLines { get; set; }
        
        /// <summary>
        /// This property is the reference base document
        /// </summary>
        public List<DocumentReferences> DocumentReferences { get; set; }
        
        /// <summary>
        /// Represents or establishes tax withholding codes, but is not mandatory
        /// </summary>
        public List<WithholdingTaxCode> WithholdingTaxDataCollection { get; set; }

        /// <summary>
        /// Represents or establishes list of additional expenses
        /// </summary>
        public List<AdditionalExpense> DocumentAdditionalExpenses { get; set; }

        /// <summary>
        /// Represents the code of the ship to address
        /// </summary>
        public string ShipToCode { get; set; }

        /// <summary>
        /// Gets or sets whether the document is handwritten. Default is "tNO".
        /// </summary>
        public string HandWritten { get; set; } = "tNO";
        
    }

    /// <summary>
    /// Represents a line item in a sales document, including details such as item code, quantity, price, and tax information.
    /// </summary>
    public class SalesDocumentLine
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
        /// Gets or sets the unit price of the item.
        /// </summary>
        public decimal UnitPrice { get; set; }

        /// <summary>
        /// Gets or sets the quantity of the item in this line.
        /// </summary>
        public decimal Quantity { get; set; }

        /// <summary>
        /// Gets or sets the tax code applicable to the item.
        /// </summary>
        public string TaxCode { get; set; }

        /// <summary>
        /// Gets or sets the rate of tax applicable to the item.
        /// </summary>
        public string TaxRate { get; set; }

        /// <summary>
        /// Gets or sets whether this line is a tax-only line. Default is "tNO".
        /// </summary>
        public string TaxOnly { get; set; } = "tNO";

        /// <summary>
        /// Gets or sets the code of the warehouse where the item is stored.
        /// </summary>
        public string WarehouseCode { get; set; }

        /// <summary>
        /// Gets or sets the discount percentage applied to this line.
        /// </summary>
        public decimal DiscountPercent { get; set; }

        /// <summary>
        /// Gets or sets the costing code for financial purposes.
        /// </summary>
        public string CostingCode { get; set; }

        /// <summary>
        /// Gets or sets the unit of measure entry ID.
        /// </summary>
        public int UoMEntry { get; set; }

        /// <summary>
        /// Gets or sets the total amount for this line, including any applied discounts.
        /// </summary>
        public decimal LineTotal { get; set; }

        /// <summary>
        /// Gets or sets the line number in the document.
        /// </summary>
        public int LineNum { get; set; }

        /// <summary>
        /// Gets or sets the base document type (e.g., order, invoice).
        /// </summary>
        public int BaseType { get; set; } = -1;

        /// <summary>
        /// Gets or sets the currency of the line item.
        /// </summary>
        public string Currency { get; set; }

        /// <summary>
        /// Gets or sets the base document entry, if this line is linked to another document.
        /// </summary>
        public int? BaseEntry { get; set; }

        /// <summary>
        /// Gets or sets the line number in the base document, if this line is linked to another document.
        /// </summary>
        public int? BaseLine { get; set; } = -1;

        /// <summary>
        /// Gets or sets the status of this line (e.g., open, closed).
        /// </summary>
        public string LineStatus { get; set; }

        /// <summary>
        /// Gets or sets the type of tree structure, indicating whether this item is part of a bill of materials. Default is "iNotATree".
        /// </summary>
        public string TreeType { get; set; } = "iNotATree";

        /// <summary>
        /// Gets or sets the batch number if the item is managed by batches.
        /// </summary>
        public string ManBtchNum { get; set; }

        /// <summary>
        /// Gets or sets the serial number if the item is managed by serial numbers.
        /// </summary>
        public string ManSerNum { get; set; }

        /// <summary>
        /// Gets or sets the code of the parent item, if this line represents a component in a bill of materials.
        /// </summary>
        public string FatherCode { get; set; }

        /// <summary>
        /// Gets or sets the list of user-defined fields (UDFs) associated with this line.
        /// </summary>
        public List<CL.STRUCTURES.CLASSES.Udf.Udf> Udfs { get; set; }

        /// <summary>
        /// Gets or sets the list of unit of measure master data associated with this item.
        /// </summary>
        public List<UoMMasterData> UoMMasterData { get; set; }

        /// <summary>
        /// Gets or sets the list of batch numbers associated with this line, if applicable.
        /// </summary>
        public List<BatchNumbers> BatchNumbers { get; set; }

        /// <summary>
        /// Gets or sets the list of serial numbers associated with this line, if applicable.
        /// </summary>
        public List<SerialNumbers> SerialNumbers { get; set; }

        /// <summary>
        /// Gets or sets the list of currencies used in the line.
        /// </summary>
        public List<LinesCurrencies> LinesCurrenciesList { get; set; }

        /// <summary>
        /// Gets or sets the bin allocations for this line, if applicable.
        /// </summary>
        public List<DocumentLinesBinAllocations> DocumentLinesBinAllocations { get; set; }

        /// <summary>
        /// Gets or sets the current stock on hand for this item.
        /// </summary>
        public double OnHand { get; set; }

        /// <summary>
        /// Gets or sets whether this item is classified as an inventory item.
        /// </summary>
        public string InventoryItem { get; set; }

        /// <summary>
        /// Indicates which flow to use for bill of materials.
        /// </summary>
        public string HideComp { get; set; }

        /// <summary>
        /// Gets or sets the second-level costing code for financial purposes.
        /// </summary>
        public string CostingCode2 { get; set; }

        /// <summary>
        /// Gets or sets the third-level costing code for financial purposes.
        /// </summary>
        public string CostingCode3 { get; set; }

        /// <summary>
        /// Gets or sets the fourth-level costing code for financial purposes.
        /// </summary>
        public string CostingCode4 { get; set; }

        /// <summary>
        /// Gets or sets the fifth-level costing code for financial purposes.
        /// </summary>
        public string CostingCode5 { get; set; }

        /// <summary>
        /// Gets or sets VAT liability.
        /// </summary>
        public int VATLiable { get; set; }

        /// <summary>
        /// Indicates if use Freight.
        /// </summary>
        public bool Freight { get; set; }

        // <summary>
        /// Indicates if is a line freight.
        /// </summary>
        public bool IsAServerLine { get; set; }

        /// <summary>
        /// Represents the code of the ship to address
        /// </summary>
        public string ShipToCode { get; set; }


    }
}