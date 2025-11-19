using System;
using System.ComponentModel.DataAnnotations;

namespace CLMLTEMA.MODELS
{
    public class Transactions
    {
        [Key]
        public int Id { get; set; }
        public int DocEntry { get; set; }
        public string InvoiceNumber { get; set; }
        public string DocumentKey { get; set; }
        public string User { get; set; }
        public string TerminalId { get; set; }
        public DateTime CreationDate { get; set; }
        public string SerializedTransaction { get; set; }
        public string TransactionId { get; set; }
    }
}