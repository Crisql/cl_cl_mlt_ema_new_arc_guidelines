using System;
using System.Collections.Generic;

namespace CLMLTEMA.MODELS.SAP
{
    public class InternalReconciliations
    {
        public DateTime ReconDate { get; set; } = DateTime.Now;
        public string CardOrAccount { get; set; } = "coaCard";
        public List<InternalReconciliationRows> InternalReconciliationOpenTransRows { get; set; }
    }

    public class InternalReconciliationRows
    {
        public string CreditOrDebit { get; set; }
        public decimal ReconcileAmount { get; set; }
        public string ShortName { get; set; }
        public int SrcObjAbs { get; set; }
        public string SrcObjTyp { get; set; }
        public decimal CashDiscount { get; set; } = 0;
        public string Selected { get; set; } = "tYES";
        public int TransRowId { get; set; }
        public int TransId { get; set; }
    }

    public class PayInAccount
    { 
        public int DocEntry { get; set; }
        public int DocNum { get; set; }
        public decimal DocTotal { get; set; }
        public decimal Saldo { get; set; }
        public string DocCurrency { get; set; }
        public int TransId { get; set; }
        public string DocumentType  { get; set; }
        public DateTime DocDate { get; set; }
        public string ObjType { get; set; }
    }  
    public class InternalReconciliationsResponse
    {
        public int ReconNum { get; set; }
    }
}