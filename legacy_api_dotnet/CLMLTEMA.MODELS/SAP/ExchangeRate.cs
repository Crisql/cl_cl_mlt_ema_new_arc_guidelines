using System;

namespace CLMLTEMA.MODELS.SAP
{
    public class ExchangeRate
    {
        public decimal Rate { get; set; }
    }
    
    public class UpcomingExchangeRate : ExchangeRate
    {
        public DateTime RateDate { get; set; }
    }
}