using System.Collections.Generic;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
    public class GoodsReturnRows
    {
        public string ItemCode { get; set; }
        public string ItemDescription { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Quantity { get; set; }
        public decimal DiscountPercent { get; set; }
        public string WarehouseCode { get; set; }
        public string TaxCode { get; set; }
        public string TaxOnly { get; set; } = "tNO";
        public int UoMEntry { get; set; }
        /// <summary>
        /// Currency code used for this line
        /// </summary>
        public string Currency { get; set; }
        public List<Udf> Udfs { get; set; }
        /// <summary>
        /// Item base type (default value is -1)
        /// </summary>
        public int BaseType { get; set; } = -1;

        /// <summary>
        /// Item base entry (nullable).
        /// </summary>
        public int? BaseEntry { get; set; }
        /// <summary>
        ///  List of master data units of measure
        /// </summary>
        public List<UoMMasterData> UoMMasterData { get; set; }
        
        /// <summary>
        /// Name warehouse of item
        /// </summary>
        public string WhsName { get; set; }
        
        /// <summary>
        /// Tax rate apply to the line
        /// </summary>
        public decimal TaxRate { get; set; }
        
        /// <summary>
        /// Gets or sets VAT liability.
        /// </summary>
        public int VATLiable { get; set; }

    }
}