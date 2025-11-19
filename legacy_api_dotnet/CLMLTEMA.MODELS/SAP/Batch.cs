using System.Collections.Generic;

namespace CLMLTEMA.MODELS.SAP
{
    public class Batch
    {
        public int SysNumber { get; set; }
        public string DistNumber { get; set; }
        public decimal Stock { get; set; }
        public decimal Disponible { get; set; }
        public decimal CommitQty { get; set; }
        public decimal Quantity { get; set; }
        public List<Location> Locations { get; set; }
    }

    public class BatchsBinCode : Batch
    {
        public int AbsEntry { get; set; }
        public string BinCode { get; set; }
        public decimal OnHandQty { get; set; }
    }

    public class BatchNumbers
    {
        public string BatchNumber { get; set; }
        public int SystemSerialNumber { get; set; }
        public decimal Quantity { get; set; }
    }
}