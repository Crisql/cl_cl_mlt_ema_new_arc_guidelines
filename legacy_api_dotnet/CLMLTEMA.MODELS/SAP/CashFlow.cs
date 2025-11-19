using System;

namespace CLMLTEMA.MODELS.SAP
{
    public class CashFlow
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public int U_INTERNAL_K { get; set; }
        public DateTime U_CreationDate { get; set; } = DateTime.Now;
        public double U_Amount { get; set; }
        public string U_Type { get; set; }
        public string U_Reason { get; set; }
        public string U_Details { get; set; }
    }
}