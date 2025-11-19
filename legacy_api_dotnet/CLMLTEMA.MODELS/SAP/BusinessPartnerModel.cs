using CL.STRUCTURES.ATTRIBUTES;
using CL.STRUCTURES.CLASSES.SAP;

namespace CLMLTEMA.MODELS.SAP
{
    public class BusinessPartnerModel //: BusinessPartner
    {
        [MasterKey] public string CardCode { get; set; }
        public string CardName { get; set; }
        public string CardType { get; set; }
        public string FederalTaxID { get; set; }
        public string EmailAddress { get; set; }
        public string Address { get; set; }
        public string Phone1 { get; set; }
        public int Series { get; set; }
        public string Currency { get; set; }
        public int PayTermsGrpCode { get; set; }
        public int PriceListNum { get; set; }
    }
}