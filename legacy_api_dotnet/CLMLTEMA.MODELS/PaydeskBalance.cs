using System.ComponentModel.DataAnnotations.Schema;
using CL.STRUCTURES.CLASSES.PresentationEntities;
using CL.STRUCTURES.INTERFACES;

namespace CLMLTEMA.MODELS
{
    public class PaydeskBalance : BaseEntity,IClDatabaseServices
    {
        public string UserId { get; set; }
        public string UserSignature { get; set; }
        public decimal CashAmount { get; set; }
        public decimal CardAmount { get; set; }
        public decimal TransferAmount { get; set; }
        public decimal CashflowIncomme { get; set; }
        public decimal CashflowEgress { get; set; }
        public decimal CardAmountPinpad { get; set; }
        public string Terminal { get; set; }
        public decimal ExchangeRate { get; set; }
        public string UrlReport { get; set; }
        public int CompanyId { get; set; }
        public Company Company { get; set; }

        [NotMapped]
        public string Email { get; set; }
        [NotMapped]
        public string License { get; set; }
        [NotMapped]
        public string Currency { get; set; }
        
        /// <summary>
        /// Represents or sets the unique identifier of the seller
        /// </summary>
        [NotMapped]
        public int SlpCode { get; set; }
    }
}