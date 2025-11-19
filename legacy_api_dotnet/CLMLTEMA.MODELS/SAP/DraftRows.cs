using System.Collections.Generic;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
     /// <summary>
    /// Represents a row in the preliminary document
    /// </summary>
    public class DraftsRows
    {
        /// <summary>
        /// Item code in sap
        /// </summary>
        public string ItemCode { get; set; }
        
        /// <summary>
        /// Item description or name
        /// </summary>
        public string ItemDescription { get; set; }
        
        /// <summary>
        /// Unit price of item
        /// </summary>
        public decimal UnitPrice { get; set; }
        
        /// <summary>
        /// Item quantity.
        /// </summary>
        public decimal Quantity { get; set; }
        
        /// <summary>
        /// Item tax code
        /// </summary>
        public string TaxCode { get; set; }
        
        /// <summary>
        /// Item tax only flag (default value is "tNO")
        /// </summary>
        public string TaxOnly { get; set; } = "tNO";
        
        /// <summary>
        /// Item discount percentage
        /// </summary>
        public decimal DiscountPercent { get; set; }
        
        /// <summary>
        /// Item line number.
        /// </summary>
        public int LineNum { get; set; }
        
        /// <summary>
        /// Item line status.
        /// </summary>
        public string LineStatus { get; set; }
        
        /// <summary>
        /// Item tax rate.
        /// </summary>
        public decimal TaxRate { get; set; }
        
        /// <summary>
        /// Warehouse code where the item is located
        /// </summary>
        public string WarehouseCode { get; set; }
        
        /// <summary>
        /// Unit of measurement of the item
        /// </summary>
        public int UoMEntry { get; set; }
        
        /// <summary>
        /// Item Cost Code
        /// </summary>
        public string CostingCode { get; set; }
        
        /// <summary>
        /// List of user-defined fields (UDFs).
        /// </summary>
        public List<Udf> Udfs { get; set; }
        
        /// <summary>
        ///  List of master data units of measure
        /// </summary>
        public List<UoMMasterData> UoMMasterData { get; set; }
        
        /// <summary>
        /// List of item currencies
        /// </summary>
        public List<LinesCurrencies> LinesCurrenciesList { get; set; }
        
        /// <summary>
        /// Name of warehouse
        /// </summary>
        public string WhsName { get; set; }
        /// <summary>
        /// Currency of the line
        /// </summary>
        public string Currency { get; set; }
        
        /// <summary>
        /// Property item material
        /// </summary>
        public string TreeType { get; set; } = "iNotATree";
        
        /// <summary>
        /// Name socio father code
        /// </summary>
        public string FatherCode { get; set; }
        
        /// <summary>
        /// Item with batch
        /// </summary>
        public string ManBtchNum { get; set; }
        
        /// <summary>
        /// Item with serie
        /// </summary>
        public string ManSerNum { get; set; }
        
        /// <summary>
        /// Stock item
        /// </summary>
        public double OnHand { get; set; }
        
        /// <summary>
        /// Total line
        /// </summary>
        public decimal LineTotal { get; set; }
        
        /// <summary>
        /// Item of inventory
        /// </summary>
        public string InventoryItem { get; set; }
        
        /// <summary>
        /// List of batch by items
        /// </summary>
        public List<BatchNumbers> BatchNumbers { get; set; }
        
        /// <summary>
        /// List of series by items
        /// </summary>
        public List<SerialNumbers> SerialNumbers { get; set; }
        
        /// <summary>
        /// List of allocations by item
        /// </summary>
        public List<DocumentLinesBinAllocations> DocumentLinesBinAllocations { get; set; }
    }
}