using System;
using System.Collections.Generic;
using CL.STRUCTURES.ATTRIBUTES;
using CL.STRUCTURES.CLASSES.SAP;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
    public class BarCodeMasterData
    {
        [MasterKey] public int AbsEntry { get; set; }
        public string ItemNo { get; set; }
        public string Barcode { get; set; }
        public string FreeText { get; set; }
    }


    public class ItemModel
    {
        public string ItemCode { get; set; }

        public string ItemName { get; set; }
    }

    public class ItemsModel : Item
    {
        public decimal IsCommited { get; set; }
        public decimal OnOrder { get; set; }
        public string WhsCode { get; set; }
        public string ItemClass { get; set; }
        public string ForeignName { get; set; }
        public string Frozen { get; set; } = "tYES";
        public int Series { get; set; }
        public decimal UnitPriceFC { get; set; }
        public string BarCode { get; set; }
        public List<BarCodeMasterData> ItemBarCodeCollection { get; set; }
        public List<ItemPrice> ItemPrices { get; set; }
        public List<UoMMasterData> UoMMasterData { get; set; }
        public decimal DiscountPercent { get; set; }
        public double LastPurchasePrice { get; set; }
        public double LastPurchasePriceFC { get; set; }
        public bool HasInconsistency { get; set; }
        public string InconsistencyMessage { get; set; }
        public int PriceList { get; set; }
        public string TreeType { get; set; }
        public List<Udf> Udfs { get; set; }
        public List<LinesCurrencies> LinesCurrenciesList { get; set; }
        public List<BillOfMaterial> BillOfMaterial { get; set; } = new List<BillOfMaterial>();
        /// <summary>
        /// Quantity of the item
        /// </summary>
        public double Quantity { get; set; }
    }
    
    public class ItemInventoryDetail : Item
    { 
        public string ForeignName { get; set; }
        public string ItemClass { get; set; }
        public string WhsCode { get; set; }
        public string WhsName { get; set; }
        public double IsCommited { get; set; }
        public double OnOrder { get; set; }
        public double Available { get; set; }
    }

    /// <summary>
    /// Represents a model for SAP items, extending the base ItemsModel class.
    /// </summary>
    public class ItemsModelSap : ItemsModel
    {
        /// <summary>
        /// Indicates whether the component is hidden.
        /// </summary>
        public string HideComp { get; set; }

        /// <summary>
        /// Indicates whether a discount has been applied.
        /// </summary>
        public bool HasDiscountApplied { get; set; }

        /// <summary>
        /// Indicates VAT liability.
        /// </summary>
        public int VATLiable { get; set; }
        
        /// <summary>
        /// Indicates if use Freight.
        /// </summary>
        public string Freight { get; set; }
    }

    public class BillOfMaterial : ItemsModel
    {
        public string ManSerNum { get; set; }
        public string ManBtchNum { get; set; }
        /// <summary>
        /// Indicates VAT liability.
        /// </summary>
        public int VATLiable { get; set; }
    }

    /// <summary>
    /// The model of the bill of materials to sync
    /// </summary>
    public class BillOfMaterialToSync
    {
        /// <summary>
        /// The code of the child item
        /// </summary>
        public string ItemCode { get; set; }
        /// <summary>
        /// The code of the parent item
        /// </summary>
        public string FatherCode { get; set; }
        /// <summary>
        /// The quantity of the child item to make the parent
        /// </summary>
        public decimal Quantity { get; set; }
    }

    public class OnHandSeries
    {
        public double OnHand { get; set; }
    }

    public class LinesCurrencies
    {
        public string Id { get; set; }
        public string DocCurrency { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
    }

    public class CurrenciesAdditional
    {
        public string Currency { get; set; }
        public string Currency1 { get; set; }
        public string Currency2 { get; set; }
        public decimal Price { get; set; }
        public decimal AddPrice1 { get; set; }
        public decimal AddPrice2 { get; set; }
    }
}