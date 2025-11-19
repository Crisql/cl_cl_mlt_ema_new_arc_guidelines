namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents an item to be included in freight calculations.
    /// </summary>
    public class ItemToFreight
    {
        /// <summary>
        /// Gets or sets the unique item code.
        /// </summary>
        public string ItemCode { get; set; }

        /// <summary>
        /// Gets or sets the name of the item.
        /// </summary>
        public string ItemName { get; set; }

        /// <summary>
        /// Gets or sets the tax code associated with the item.
        /// </summary>
        public string TaxCode { get; set; }

        /// <summary>
        /// Gets or sets the tax rate applied to the item.
        /// </summary>
        public decimal TaxRate { get; set; }

        /// <summary>
        /// Gets or sets the business partner (customer or supplier) code associated with the item.
        /// </summary>
        public string CardCode { get; set; }

        /// <summary>
        /// Gets or sets the quantity of the item.
        /// </summary>
        public decimal Quantity { get; set; }

        /// <summary>
        /// Gets or sets the price of a single unit of the item.
        /// </summary>
        public decimal Price { get; set; }

        /// <summary>
        /// Gets or sets the warehouse code where the item is stored.
        /// </summary>
        public string WhsCode { get; set; }

        /// <summary>
        /// Gets or sets the specific unit of measure entry for the item.
        /// </summary>
        public int SUoMEntry { get; set; }
    }
}