using System;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents a mobile business partner entity, containing general, 
    /// financial, and contact details for use in mobile applications.
    /// </summary>
    public class MobileBusinessPartner
    {
        /// <summary>
        /// Unique code that identifies the business partner.
        /// </summary>
        public string CardCode { get; set; }

        /// <summary>
        /// Name of the business partner.
        /// </summary>
        public string CardName { get; set; }

        /// <summary>
        /// Default transaction currency for the business partner.
        /// </summary>
        public string Currency { get; set; }

        /// <summary>
        /// Default shipping address code.
        /// </summary>
        public string ShipToDef { get; set; }

        /// <summary>
        /// Default tax code assigned to the business partner.
        /// </summary>
        public string TaxCode { get; set; }

        /// <summary>
        /// Credit limit assigned to the business partner.
        /// </summary>
        public string CreditLine { get; set; }

        /// <summary>
        /// Current account balance of the business partner.
        /// </summary>
        public string Balance { get; set; }

        /// <summary>
        /// Primary phone number.
        /// </summary>
        public string Phone1 { get; set; }

        /// <summary>
        /// Mobile phone number.
        /// </summary>
        public string Cellular { get; set; }

        /// <summary>
        /// Email address.
        /// </summary>
        public string EMail { get; set; }

        /// <summary>
        /// Default discount percentage.
        /// </summary>
        public decimal Discount { get; set; }

        /// <summary>
        /// Discount applied at document header level.
        /// </summary>
        public decimal HeaderDiscount { get; set; }

        /// <summary>
        /// Identifier of the default price list.
        /// </summary>
        public int PriceListNum { get; set; }

        /// <summary>
        /// Payment terms code.
        /// </summary>
        public int PayTermsCode { get; set; }

        /// <summary>
        /// Business partner group identifier.
        /// </summary>
        public int BPGroup { get; set; }

        /// <summary>
        /// Default contact person name.
        /// </summary>
        public string ContactPerson { get; set; }

        /// <summary>
        /// Type of identification document.
        /// </summary>
        public string TipoIdentificacion { get; set; }

        /// <summary>
        /// Identification number (e.g., national ID).
        /// </summary>
        public string Cedula { get; set; }

        /// <summary>
        /// Province where the business partner is located.
        /// </summary>
        public string Provincia { get; set; }

        /// <summary>
        /// Canton where the business partner is located.
        /// </summary>
        public string Canton { get; set; }

        /// <summary>
        /// District where the business partner is located.
        /// </summary>
        public string Distrito { get; set; }

        /// <summary>
        /// Neighborhood of the business partner.
        /// </summary>
        public string Barrio { get; set; }

        /// <summary>
        /// Full address details.
        /// </summary>
        public string Direccion { get; set; }

        /// <summary>
        /// Subtype of the business partner.
        /// </summary>
        public string SubTipo { get; set; }

        /// <summary>
        /// Indicates if the business partner is a cash customer (0/1).
        /// </summary>
        public int CashCustomer { get; set; }

        /// <summary>
        /// Group code associated with the business partner.
        /// </summary>
        public int GroupCode { get; set; }

        /// <summary>
        /// Tax identification number.
        /// </summary>
        public string LicTradNum { get; set; }

        /// <summary>
        /// Website or online presence.
        /// </summary>
        public string IntrntSite { get; set; }

        /// <summary>
        /// Additional notes or comments.
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// Control series identifier.
        /// </summary>
        public int ControlSerie { get; set; }

        /// <summary>
        /// Special condition for OTCX transactions.
        /// </summary>
        public string OTCXCondition { get; set; }

        /// <summary>
        /// Last update date and time (stored as integer).
        /// </summary>
        public int UpdateDateTime { get; set; }
    }
}