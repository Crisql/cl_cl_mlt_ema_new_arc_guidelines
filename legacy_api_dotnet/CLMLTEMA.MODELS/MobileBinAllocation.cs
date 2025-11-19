namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents the allocation of a batch to a specific bin in a warehouse for mobile inventory operations.
    /// </summary>
    public class MobileBinAllocation
    {
        /// <summary>
        /// The internal absolute identifier of the bin.
        /// </summary>
        public int BinAbs { get; set; }

        /// <summary>
        /// The code or name used to identify the bin.
        /// </summary>
        public string BinCode { get; set; }

        /// <summary>
        /// The batch number of the item stored in the bin.
        /// </summary>
        public string BatchNumber { get; set; }

        /// <summary>
        /// The available stock quantity of the batch in the bin.
        /// </summary>
        public decimal Stock { get; set; }
    }
}