namespace CLMLTEMA.MODELS.SAP
{
    public class PaymentInvoices
    {
        public int DocEntry { get; set; }
        public decimal SumApplied { get; set; }
        public decimal AppliedFC { get; set; }
        public string InvoiceType { get; set; }  
        
    }
}