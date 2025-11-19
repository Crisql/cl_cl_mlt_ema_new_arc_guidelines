using System.Collections.Generic;
using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS.SAP
{
    public class SalesOrderRows : SalesDocumentLine
    {
        public string DistNumber { get; set; } 
        public int SysNumber { get; set; }
        public string WhsName { get; set; }
    }
}
