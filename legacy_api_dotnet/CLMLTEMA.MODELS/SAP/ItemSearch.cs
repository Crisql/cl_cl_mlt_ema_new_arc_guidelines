namespace CLMLTEMA.MODELS.SAP
{
    public class ItemSearch
    {
        public string ItemCode { get; set; }
        public string ItemName { get; set; }
        public string BarCode { get; set; }
        public string OnHand { get; set; }
        public string DistNumberSerie { get; set; }
        public string DistNumberLote { get; set; }
        public string SysNumber { get; set; }
        public string ManBtchNum { get; set; }
        public string ManSerNum { get; set; }
        public string BinCode { get; set; }
        public int? AbsEntry { get; set; }
        public string DefaultWarehouse { get; set; }
        public string TypeAheadFormat { get; set; }
        
    }
}