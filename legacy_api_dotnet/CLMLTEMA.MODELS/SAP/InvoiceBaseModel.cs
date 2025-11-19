using System;
using System.Collections.Generic;

namespace CLMLTEMA.MODELS.SAP
{
    public class InvoiceBaseModel : DocumentBaseModel
    {
    }

    public class InvoiceModel : DocumentModel
    {
        private List<InvoiceLinesModel> DocumentLines { get; set; }
    }

    public class InvoiceLinesModel : DocumentLinesModel
    {
    }

    public class GetInvoicesSLModel
    {
        public int DocEntry { get; set; }
        public int DocNum { get; set; }
        public string CardCode { get; set; }
        public string CardName { get; set; }
        public DateTime DocDate { get; set; }
        public string DocCurrency { get; set; }
        public decimal DocTotal { get; set; }
    }
}