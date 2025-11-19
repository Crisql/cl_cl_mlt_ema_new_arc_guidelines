using System;

namespace CLMLTEMA.MODELS.SAP
{
    public class PaymentChecks
    {
        public DateTime DueDate { get; set; }
        public int CheckNumber { get; set; }
        public string BankCode { get; set; }
        public string AccounttNum { get; set; }
        public string CountryCode { get; set; }
        public string CheckAccount { get; set; }
        public decimal CheckSum { get; set; }
    }
}