using System.Collections.Generic;

namespace CLMLTEMA.MODELS.SAP
{
    public class SalesServicePreview
    {
        public DocumentPreview Document { get; set; }
    }
    public class DocumentPreview
    {
        public string CardCode { get; set; }
        public List<DocumentLinesSL> DocumentLines { get; set; }
    }
    public class DocumentLinesSL
    {
        public string ItemCode { get; set; }
        public double Quantity { get; set; }
        public double DiscountPercent { get; set; }
        public string TaxCode { get; set; }
        public double UnitPrice { get; set; }
        public string TaxOnly { get; set; }
        public string Currency { get; set; }

    }
    public class TotalsPreviewSLDocument
    {
        public decimal DocTotal { get; set; }
        public decimal DocTotalSys { get; set; }

    }
}