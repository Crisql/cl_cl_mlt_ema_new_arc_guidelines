using System;
using System.Collections.Generic;
using CL.STRUCTURES.ATTRIBUTES;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
    /// <summary>
    /// Represents a Goods Receipt Purchase Order.
    /// </summary>
    public class GoodsReceiptPO : IDocument
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
        /// Document Series
        /// </summary>
        public int Series { get; set; }

        /// <summary>
        /// Card code of the business partner for whom the document was created
        /// </summary>
        public string CardCode { get; set; }

        /// <summary>
        /// Document currency.
        /// </summary>
        public string DocCurrency { get; set; }

        /// <summary>
        /// Price list used to create the document
        /// </summary>
        public int PriceList { get; set; }

        /// <summary>
        /// Card name of the business partner for whom the document 
        /// </summary>
        public string CardName { get; set; }

        /// <summary>
        /// Additional comments on the document
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
        /// Seller code
        /// </summary>
        public int SalesPersonCode { get; set; }

        /// <summary>
        /// List of lines in the document
        /// </summary>
        public List<GoodsReceiptPORows> DocumentLines { get; set; }

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
    }
}