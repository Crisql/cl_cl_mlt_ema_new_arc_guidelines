namespace CLMLTEMA.MODELS.SAP
{
    public class ItemPrice
    {
        public string ItemCode { get; set; }
        public int PriceList { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; }
    }
    
    public class ItemDiscount
    {
        public string ItemCode { get; set; }
        public double Discount { get; set; }
        public string CardCode { get; set; }
        public string GroupType { get; set; }
        public string ObjType { get; set; }
        public string ItemGroup { get; set; }
        public string CardGroup { get; set; }
    }

    public class ItemDiscounts : ItemDiscount
    {
        public string DiscRelBp { get; set; }
        public string DiscRelItem { get; set; }
    }
}