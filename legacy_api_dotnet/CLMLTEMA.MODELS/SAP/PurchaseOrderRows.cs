using System.Collections.Generic;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
    public class PurchaseOrderRows
    {
        public string ItemCode { get; set; }
        public string ItemDescription { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Quantity { get; set; }
        public decimal DiscountPercent { get; set; }
        public string WarehouseCode { get; set; }
        /// <summary>
        /// Currency code used for this line
        /// </summary>
        public string Currency { get; set; }
        public string TaxCode { get; set; }
        public string TaxOnly { get; set; } = "tNO";
        public decimal TaxRate { get; set; }
        public int UoMEntry { get; set; }
        public int BaseType { get; set; }
        public int? BaseEntry { get; set; }
        public int? BaseLine { get; set; }
        public int LineNum { get; set; }
        public string LineStatus { get; set; } 
        public List<Udf> Udfs { get; set; }
        
        /// <summary>
        /// List measurement units
        /// </summary>
        public List<UoMMasterData> UoMMasterData { get; set; }
        
        /// <summary>
        /// Name warehouse of item
        /// </summary>
        public string WhsName { get; set; }
        
        /// <summary>
        /// Gets or sets VAT liability.
        /// </summary>
        public int VATLiable { get; set; }
    }
}