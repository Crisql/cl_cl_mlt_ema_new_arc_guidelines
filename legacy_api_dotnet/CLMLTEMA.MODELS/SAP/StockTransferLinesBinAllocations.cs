namespace CLMLTEMA.MODELS.SAP
{
    public class StockTransferLinesBinAllocations
    {
        public string BinActionType { get; set; }
        public int BinAbsEntry { get; set; }
        public double Quantity { get; set; }
        public int BaseLineNumber { get; set; }
        public int SerialAndBatchNumbersBaseLine { get; set; }
    }
    
    /// <summary>
    /// Represents the allocation of bins for stock transfer draft lines.
    /// </summary>
    public class StockTransferDraftLinesBinAllocations
    {
        /// <summary>
        /// Gets or sets the absolute entry of the bin.
        /// </summary>
        /// <value>The absolute entry identifier for the bin.</value>
        public int BinAbsEntry { get; set; }

        /// <summary>
        /// Gets or sets the quantity of items allocated to the bin.
        /// </summary>
        /// <value>The quantity of items.</value>
        public double Quantity { get; set; }

        /// <summary>
        /// Gets or sets the base line number associated with the allocation.
        /// </summary>
        /// <value>The base line number.</value>
        public int BaseLineNumber { get; set; }

        /// <summary>
        /// Gets or sets the base line number for serial and batch numbers.
        /// </summary>
        /// <value>The serial and batch numbers base line.</value>
        public int SerialAndBatchNumbersBaseLine { get; set; }
        
        /// <summary>
        /// Gets or sets the BinActionType type.
        /// </summary>
        /// <value>The BinActionType indicated for batToWarehouse or batFromWarehouse.</value>
        public string BinActionType { get; set; }
    }
}