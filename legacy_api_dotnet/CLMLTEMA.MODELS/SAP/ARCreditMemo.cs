using System;
using System.Collections.Generic;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
    public class ARCreditMemo : SalesDocument
    {
        /// <summary>
        /// base document reference
        /// </summary>
        public string NumAtCard { get; set; }
        
        /// <summary>
        /// Loyalty points redemption transaction ID
        /// </summary>
        public string IdTranRedimir { get; set; }
        
        /// <summary>
        /// Loyalty points accumulation transaction ID
        /// </summary>
        public string IdTranAcumular { get; set; }
        
        /// <summary>
        /// Document key autogenerate
        /// </summary>
        public string DocumentKey { get; set; }
        
        /// <summary>
        /// Indicates if you have transactions in the tapp loyalty plan
        /// </summary>
        public bool WithTransactionTapp { get; set; }
        
        /// <summary>
        /// Document total USD
        /// </summary>
        public decimal DocTotalFC { get; set; }

    }
    public class DocumentReferences
    {
        public int RefDocEntr { get; set; }
        public int RefDocNum { get; set; }
        public string RefObjType { get; set; }
        public string Remark { get; set; }
    }
    
    public class ReconciliationCreditMemo
    {
        public int DocEntry { get; set; }
        public int DocNum { get; set; }
        public string DocumentType { get; set; }
        public string CardCode { get; set; }
        public string CardName { get; set; }
        public string NumAtCard { get; set; }
        public string DocCurrency { get; set; }
        public decimal Total { get; set; }
        public decimal Saldo { get; set; }
        public DateTime DocDate { get; set; }
        public DateTime DocDueDate { get; set; }
        public int InstlmntID { get; set; }
        public int TransId { get; set; }
        public decimal TotalUSD { get; set; }
        public decimal SaldoUSD { get; set; }
        public string ObjType { get; set; }
    }
}