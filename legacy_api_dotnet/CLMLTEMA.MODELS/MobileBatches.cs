using System.Collections.Generic;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents a batch of a specific item in a mobile inventory context.
    /// </summary>
    public class MobileBatches
    {
        /// <summary>
        /// The code of the item assigned to this batch.
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// The unique identifier or number for the batch.
        /// </summary>
        public string BatchNumber { get; set; }

        /// <summary>
        /// The quantity of the item in this batch.
        /// </summary>
        public decimal Quantity { get; set; }
    }

    /// <summary>
    /// Represents a collection of item batches within a specific warehouse, used in mobile scenarios.
    /// </summary>
    public class MobileBatchesList
    {
        /// <summary>
        /// The code of the item to which the batch list belongs.
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// The code of the warehouse where the batches are stored.
        /// </summary>
        public string WarehouseCode { get; set; }

        /// <summary>
        /// The list of batches associated with the item in the specified warehouse.
        /// </summary>
        public List<MobileBatches> BatchNumbers { get; set; }
    }
}