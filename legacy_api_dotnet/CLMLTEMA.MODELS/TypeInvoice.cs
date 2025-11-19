namespace CLMLTEMA.MODELS
{
    public class TypeInvoice
    {
        public string Name { get; set; }
        public  string Description { get; set; }
        public bool IsDefault { get; set; }
    }

    public class TypeCurrency
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Symbol { get; set; }
        public bool IsLocal { get; set; }
    }
}