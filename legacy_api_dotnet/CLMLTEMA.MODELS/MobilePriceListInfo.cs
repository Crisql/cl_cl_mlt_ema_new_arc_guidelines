using System;

namespace CLMLTEMA.MODELS
{
    public class MobilePriceListInfo
    {
        public string ListName { get; set; }
        public int ListNum { get; set; }
        public int BaseNum { get; set; }
        public decimal Factor { get; set; }
        public int GroupCode { get; set; }
        public string PrimCurr { get; set; }
    }
}