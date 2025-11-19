using System;
using System.ComponentModel.DataAnnotations;

namespace CLMLTEMA.MODELS
{
    public class Balances
    {
        [Key]
        public int Id { get; set; }
        public string XmlDocumentResponse { get; set; }
        public string ResponseCode { get; set; }
        public string AcqNumber { get; set; }
        public string CardBrand { get; set; }
        public string HotTime { get; set; }
        public string HotDate { get; set; }
        public string RefundsAmount { get; set; }
        public string RefundsTransaction { get; set; }
        public string SalesTransactions { get; set; }
        public string SalesAmount { get; set; }
        public string SalesTax { get; set; }
        public string SalesTip { get; set; }
        public DateTime CreationDate { get; set; }
        public DateTime ModificationDate { get; set; }
        public string TransactionType { get; set; }
        public string TerminalCode { get; set; }
    }
}