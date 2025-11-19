using System;

namespace CLMLTEMA.MODELS.SAP
{
    public class ItemDetail
    {
        public DateTime DocDate { get; set; } = DateTime.Now;
        public string ItemCode { get; set; }
        public string ItemDescription { get; set; }
        public string TaxCode { get; set; }
        public string WhsName { get; set; }
        public decimal OnHand { get; set; }
        public decimal Available { get; set; }
        public decimal LastPurPrc { get; set; } 
        public string Comments { get; set; } 
        public decimal DocTotal { get; set; }
        public decimal Price { get; set; }
        public decimal Quantity { get; set; }
        public string CardName { get; set; }
        public string CardCode { get; set; }
    }
    public class ItemDataForInvoiceGoodReceipt
    {
        public string ItemCode { get; set; }
        public double AVGPrice { get; set; }
        public double LastPrice { get; set; }
        public int DeviationStatus { get; set; }
        public string Message { get; set; }
    }
    public class ValidateDeviation
    {
        public int DeviationStatus { get; set; }
        public string Message { get; set; }
    }

 
}