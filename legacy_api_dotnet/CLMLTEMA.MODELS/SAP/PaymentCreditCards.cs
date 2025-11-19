using System;

namespace CLMLTEMA.MODELS.SAP
{
    public class PaymentCreditCards
    {
        public int CreditCard { get; set; }
        public string CreditAcct { get; set; }
        public string CreditCardNumber { get; set; }
        public DateTime CardValidUntil { get; set; }
        public string VoucherNum { get; set; }
        public decimal CreditSum { get; set; }
        public string U_ManualEntry { get; set; }
    }  
}