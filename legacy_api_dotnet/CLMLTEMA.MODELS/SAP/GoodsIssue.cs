using System;
using System.Collections.Generic;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
    public class GoodsIssue
    {
        /// <summary>
        /// Document internal number
        /// </summary>
        public int DocEntry { get; set; }
        
        /// <summary>
        /// Document number
        /// </summary>
        public int DocNum { get; set; }
        
        /// <summary>
        /// Document type
        /// </summary>
        public string DocType { get; set; } = "dDocument_Items";
        
        /// <summary>
        /// Document posting date
        /// </summary>
        public DateTime DocDate { get; set; } = DateTime.Now;
        
        /// <summary>
        /// Document creation date
        /// </summary>
        public DateTime TaxDate { get; set; } = DateTime.Now;
        
        /// <summary>
        /// Document currency
        /// </summary>
        public string DocCurrency { get; set; }
        
        /// <summary>
        /// Document comments
        /// </summary>
        public string Comments { get; set; }
        
        /// <summary>
        /// Group price list
        /// </summary>
        public int PaymentGroupCode { get; set; }
        
        /// <summary>
        /// Document Lines
        /// </summary>
        public List<GoodsIssueRows> DocumentLines { get; set; }
        
        /// <summary>
        /// List of dynamic fields
        /// </summary>
        public List<Udf> Udfs { get; set; }
        /// Represent the unique identifier of the document attachment
        /// </summary>
        public int? AttachmentEntry { get; set; }
    }
}