using System;

namespace CLMLTEMA.MODELS
{
    public class MobileDiscountGroup
    {
        public int AbsEntry { get; set; }
        public int Type { get; set; }
        public string CardCode { get; set; }
        public int BPGroup { get; set; }
        public string ItemCode { get; set; }
        public int ItemGroup { get; set; }
        public string AuxField { get; set; }
        public decimal Discount { get; set; }
        public DateTime CreateDate { get; set; }
        public DateTime UpdateDate { get; set; }
    }
}