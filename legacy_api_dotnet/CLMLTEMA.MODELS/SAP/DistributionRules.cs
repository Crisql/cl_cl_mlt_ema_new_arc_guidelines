using System;

namespace CLMLTEMA.MODELS.SAP
{
    public class DistributionRules
    {
        public string OcrCode { get; set; }
        public string OcrName { get; set; }
        public decimal OcrTotal { get; set; }
        public char Direct { get; set; }
        public char Locked { get; set; }
        public char DataSource { get; set; }
        public int? UserSign { get; set; }
        public int DimCode { get; set; }
        public int? AbsEntry { get; set; }
        public char Active { get; set; }
        public int? LogInstanc { get; set; }
        public int? UserSign2 { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}