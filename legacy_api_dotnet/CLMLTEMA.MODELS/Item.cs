using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CLMLTEMA.MODELS
{
    public class Item
    {
        public int? Series { get; set; }
        public string ItemCode { get; set; }
        public string ItemName { get; set; }
        public string InventoryItem { get; set; }
        public string SalesItem { set; get; }
        public string PurchaseItem { get; set; }
        public double QuantityOnStock { get; set; }
        public double QuantityOrderedFromVendors { get; set; }
        public double QuantityOrderedByCustomers { get; set; }
        public string U_IVA { get; set; }
    }

    public class ValidateInventoryTable
    {
        public string Table { get; set; }
        public string Description { get; set; }
    }

    public class ExchangeRate
    {
        public double Rate { get; set; }
    }

    public class PriceList
    {
        public int ListNum { get; set; }
        public string ListName { get; set; }
        public string PrimCurr { get; set; }
        public string AddrCurr1 { get; set; }
        public string AddrCurr2 { get; set; }
    }

    public class PayTerm
    {
        public int GroupNum { get; set; }
        public string PymntGroup { get; set; }
        public int Type { get; set; }
    }

}
