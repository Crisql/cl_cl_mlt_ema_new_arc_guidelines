namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents information about a company.
    /// </summary>
    public class MobileCompanyInformation
    {
        /// <summary>
        /// The name of the company.
        /// </summary>
        public string CompanyName { get; set; }

        /// <summary>
        /// The address or direction of the company.
        /// </summary>
        public string Direction { get; set; }

        /// <summary>
        /// The phone number of the company.
        /// </summary>
        public string Phone { get; set; }

        /// <summary>
        /// Indicates whether the company uses billing range.
        /// </summary>
        public bool UseBillingRange { get; set; }

        /// <summary>
        /// The billing range value.
        /// </summary>
        public int BillingRange { get; set; }

        /// <summary>
        /// Indicates whether the company has freight.
        /// </summary>
        public bool UseFreight { get; set; }

        /// <summary>
        /// Indicates whether the company operates in online-only mode.
        /// </summary>
        public bool OnlineOnly { get; set; }

        /// <summary>
        /// The identification of the company.
        /// </summary>
        public string Identification { get; set; }

        /// <summary>
        /// The number of decimal places to show in the price of the line.
        /// </summary>
        public int LinePriceDecimals { get; set; }

        /// <summary>
        /// The number of decimal places to show in the line total amount.
        /// </summary>
        public int LineTotalDecimals { get; set; }

        /// <summary>
        /// The number of decimal places to show in the document total amount.
        /// </summary>
        public int DocumentTotalDecimals { get; set; }
        
        /// <summary>
        /// Company id in application database
        /// </summary>
        public int CompanyId { get; set; }
        
        /// <summary>
        /// Connection id of the company
        /// </summary>
        public int ConnectionId { get; set; }
        
        /// <summary>
        /// Data base code of the company
        /// </summary>
        public string DatabaseCode { get; set; }
    }

}