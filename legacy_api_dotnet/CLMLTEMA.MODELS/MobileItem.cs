using System;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// The model of the item to synchronize in the mobile application
    /// </summary>
    public class MobileItem
    {
        /// <summary>
        /// The code of the item
        /// </summary>
        public string ItemCode { get; set; }
        /// <summary>
        /// The name of the item
        /// </summary>
        public string ItemName { get; set; }
        /// <summary>
        /// The tax code associated to the item
        /// </summary>
        public string TaxCode { get; set; }
        /// <summary>
        /// The max discount available for the item
        /// </summary>
        public decimal MaxDiscount { get; set; }
        /// <summary>
        /// The a description for the item
        /// </summary>
        public string ShortDescription { get; set; }
        /// <summary>
        /// The group of the item
        /// </summary>
        public int? GroupCode { get; set; }
        /// <summary>
        /// The measurement unit group of the item
        /// </summary>
        public int? UgpEntry { get; set; }
        /// <summary>
        /// The measurement unit of the item
        /// </summary>
        public int? SuoMEntry { get; set; }
        /// <summary>
        /// The price of the item
        /// </summary>
        public int PriceUnit { get; set; }
        /// <summary>
        /// The family of the item
        /// </summary>
        public string Family { get; set; }
        /// <summary>
        /// Indicates if the item is manage by freight
        /// </summary>
        public bool Freight { get; set; }
        /// <summary>
        /// The allowed item measurement units concatenated by comma
        /// </summary>
        public string AllowUnits { get; set; }
        /// <summary>
        /// It indicates whether the item is liable for value-added tax (VAT).
        /// </summary>
        public bool VATLiable { get; set; }
        /// <summary>
        /// This field stores the OTCX (Over the Counter Exchange) condition for the item.
        /// </summary>
        public string OTCXCondition { get; set; }
        /// <summary>
        /// Indicates if the item use batches
        /// </summary>
        public string EvalSystem { get; set; }
        /// <summary>
        /// Indicates whether batch numbers are managed manually for an item
        /// </summary>
        public string ManBtchNum { get; set; }
        /// <summary>
        /// Indicates whether serial numbers for an item are managed manually
        /// </summary>
        public string ManSerNum { get; set; }
        /// <summary>
        /// This field stores the absolute entry of the bin location where the item is stored.
        /// </summary>
        public int? BinAbs { get; set; }
        /// <summary>
        /// Indicates the bin location associated with an item in inventory
        /// </summary>
        public string BinCode { get; set; }
        /// <summary>
        /// It stores the serial number associated with the item.
        /// </summary>
        public string SerialNumber { get; set; }
        /// <summary>
        /// This field specifies the warehouse code where the item's serial number is stored.
        /// </summary>
        public string SNWhsCode { get; set; }
        /// <summary>
        /// It stores the absolute entry of the bin location where the item's serial number is stored.
        /// </summary>
        public int? SerialBinAbs { get; set; }
        /// <summary>
        /// This field indicates if the item is a material item
        /// </summary>
        public string TreeType { get; set; }
        /// <summary>
        /// The last updated date of the item (Used to optimize the synchronization)
        /// </summary>
        public int UpdateDateTime { get; set; }
    }
}