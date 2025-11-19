using System;
using System.Collections.Generic;
using CL.STRUCTURES.ATTRIBUTES;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
    /// <summary>
    /// Used to transfer a draft to a firm document
    /// </summary>
    public class Draft
    {
        [MasterKey] public int DocEntry { get; set; }
    }
    
    /// <summary>
    /// Represent a preliminary document
    /// </summary>
    public class Drafts : Draft
    {
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
        public DateTime DocDueDate { get; set; }=DateTime.Now;
        
        /// <summary>
        /// Document creation date
        /// </summary>
        public DateTime TaxDate { get; set; }=DateTime.Now;
        
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
        public List<DraftsRows> DocumentLines { get; set; }
        
        /// <summary>
        /// List of user-defined fields (UDFs)
        /// </summary>
        public List<Udf> Udfs { get; set; }
        
        /// <summary>
        /// Total document amount
        /// </summary>
        public decimal DocTotal { get; set; }
        
        /// <summary>
        /// Type document preliminary 
        /// </summary>
        public string ObjType { get; set; }
        
        /// <summary>
        /// Document status for approval
        /// </summary>
        public string Approval_Status { get; set; }
        
        /// <summary>
        /// Represent the unique identifier of the document attachment
        /// </summary>
        public int? AttachmentEntry { get; set; }
        
        /// <summary>
        /// Represents whether the invoice is a reserve or not
        /// </summary>
        public string ReserveInvoice { get; set; }

        /// <summary>
        /// Represents the code of the ship to address
        /// </summary>
        public string ShipToCode { get; set; }
    }

    /// <summary>
    /// Model to get status of draft
    /// </summary>
    public class DraftStatus : Draft
    {
        /// <summary>
        /// Represent status of docuement
        /// </summary>
        public string Status { get; set; }
        
        /// <summary>
        /// Represent if documento is simulated
        /// </summary>
        public string U_EMA_Approval_Status { get; set; }
        
        /// <summary>
        /// Represent key docuement
        /// </summary>
        public string DocumentKey { get; set; }
        
    } 
    
    /// <summary>
    /// Model to get status of draft
    /// </summary>
    public class DraftUpdateStaus : Draft
    {
        /// <summary>
        /// List of user-defined fields (UDFs)
        /// </summary>
        public List<Udf> Udfs { get; set; }
    }
}