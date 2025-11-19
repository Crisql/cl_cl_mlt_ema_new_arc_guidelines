using System;

namespace CLMLTEMA.MODELS
{
    public class MobilePriceList
    {
        public string ItemCode { get; set; }
        public int PriceList { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; }
        public int UomEntry { get; set; }
        public int UpdateDateTime { get; set; }
    }
}