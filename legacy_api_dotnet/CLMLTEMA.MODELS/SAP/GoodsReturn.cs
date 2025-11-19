using System;
using System.Collections.Generic;
using CL.STRUCTURES.ATTRIBUTES;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
    public class GoodsReturn : IDocument
    {
        /// <summary>
        /// Internal document number
        /// </summary>
        [MasterKey]
        public int DocEntry { get; set; }
        
        /// <summary>
        /// Document number
        /// </summary>
        public int DocNum { get; set; }
        
        /// <summary>
        /// Document creation series
        /// </summary>
        public int Series { get; set; }
        
        /// <summary>
        /// Business partner code
        /// </summary>
        public string CardCode { get; set; }
        
        /// <summary>
        /// Business partner name
        /// </summary>
        public string CardName { get; set; }
        
        /// <summary>
        /// Document Comments
        /// </summary>
        public string Comments { get; set; }
        
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
        /// Document Currency
        /// </summary>
        public string DocCurrency { get; set; }
        
        /// <summary>
        /// Seller code
        /// </summary>
        public int SalesPersonCode { get; set; }
        
        /// <summary>
        /// Document lines
        /// </summary>
        public List<GoodsReturnRows> DocumentLines { get; set; }
        
        /// <summary>
        /// List of dynamic fields
        /// </summary>
        public List<Udf> Udfs { get; set; }
        
        /// <summary>
        /// Document Total
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
        /// <summary>
        /// Price list used to create the document
        /// </summary>
        public int PriceList { get; set; }
        
        /// Represent the unique identifier of the document attachment
        /// </summary>
        public int? AttachmentEntry { get; set; }
    }
}