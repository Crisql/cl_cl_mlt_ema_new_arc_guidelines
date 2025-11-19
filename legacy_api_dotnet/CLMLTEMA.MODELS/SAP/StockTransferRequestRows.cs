using System.Collections.Generic;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
    public class StockTransferRequestRows
    {
        public string ItemCode { get; set; }
        public string ItemDescription { get; set; }
        public decimal Quantity { get; set; }
        public decimal Stock { get; set; }
        public List<SerialNumbers> SerialNumbers { get; set; }
        public string WarehouseCode { get; set; }
        public string FromWarehouseCode { get; set; }
        public List<Udf> Udfs { get; set; }
        public int LineNum { get; set; }
        public int? BaseLine { get; set; } = -1;
        public string BaseType { get; set; }
        public int? BaseEntry { get; set; }
        public string ManSerNum { get; set; }
        public string ManBtchNum { get; set; }
        public string DistNumber { get; set; }
        public int SysNumber { get; set; }
        public int BinAbs { get; set; }
        public string BinActivat { get; set; }
        public string LineStatus { get; set; }
        public List<WarehouseBinLocation> LocationsFrom { get; set; }
        public List<Location> LocationsTo { get; set; }
    }
}