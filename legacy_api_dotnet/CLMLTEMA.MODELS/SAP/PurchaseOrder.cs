using System;
using System.Collections.Generic;
using CL.STRUCTURES.ATTRIBUTES;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
    public class PurchaseOrder : IDocument
    {
        [MasterKey]
        public int DocEntry { get; set; }
        public int DocNum { get; set; }
        public string CardCode { get; set; }
        public int PriceList { get; set; }  
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
        public string Comments { get; set; }
        public decimal DocTotal { get; set; }
        public int SalesPersonCode { get; set; }
        public string DocCurrency { get; set; }
        public List<PurchaseOrderRows> DocumentLines { get; set; }
        public List<Udf> Udfs { get; set; }
        public string DocStatus { get; set; } 
        
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
}