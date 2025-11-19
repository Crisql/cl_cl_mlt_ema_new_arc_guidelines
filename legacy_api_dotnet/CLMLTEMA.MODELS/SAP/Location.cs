namespace CLMLTEMA.MODELS.SAP
{
    public class Location
    {
            public int AbsEntry { get; set; }
            public string BinCode { get; set; }
            public decimal Stock { get; set; }
            public decimal Quantity { get; set; }
   } 
    
    /// <summary>
    /// Manejo de ubicaciones en items
    /// </summary>
    public class DocumentLinesBinAllocations
    {
        public int SerialAndBatchNumbersBaseLine { get; set; }
        public int BinAbsEntry { get; set; }
        public decimal Quantity { get; set; }
    }
}