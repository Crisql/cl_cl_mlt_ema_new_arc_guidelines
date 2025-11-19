using CLMLTEMA.MODELS.SAP;

namespace CLMLTEMA.MODELS
{
    public class ARInvoiceWithPayment
    {
        public ARInvoice ARInvoice { get; set; }
        public IncomingPayment IncomingPayment { get; set; }
    }
}