using CL.STRUCTURES.INTERFACES;
using CL.STRUCTURES.CLASSES.LocalEntities;
using Newtonsoft.Json;

namespace CLMLTEMA.MODELS
{
    public class Setting : CLSetting, IClDatabaseServices
    {
    }
    
    /// <summary>
    /// Represents the configuration settings for a mobile application.
    /// </summary>
    public class MobileAppConfiguration
    {
        /// <summary>
        /// Indicates whether the application should operate in online-only mode.
        /// </summary>
        public bool OnlineOnly { get; set; }

        /// <summary>
        /// Indicates whether the application should use header discount.
        /// </summary>
        public bool UseHeaderDiscount { get; set; }

        /// <summary>
        /// Indicates whether the application should use freight.
        /// </summary>
        public bool UseFreight { get; set; }

        /// <summary>
        /// The time interval for performing check-ins in minutes.
        /// </summary>
        public int CheckInTime { get; set; }

        /// <summary>
        /// Indicates whether the application should use a billing range.
        /// </summary>
        public bool UseBillingRange { get; set; }

        /// <summary>
        /// The billing range value.
        /// </summary>
        public int BillingRange { get; set; }

        /// <summary>
        /// The identifier of the company associated with the configuration.
        /// </summary>
        public int CompanyId { get; set; }
    }

    /// <summary>
    /// Represents the configuration for decimal precision settings, such as line prices and total amounts in a document.
    /// </summary>
    public class DecimalConfiguration
    {
        /// <summary>
        /// The company ID associated with the configuration.
        /// </summary>
        public int CompanyId { get; set; }

        /// <summary>
        /// The number of decimal places to show for line prices.
        /// </summary>
        [JsonProperty("Price")]
        public int LinePrice { get; set; }

        /// <summary>
        /// The number of decimal places to show for line total amounts.
        /// </summary>
        [JsonProperty("TotalLine")]
        public int LineTotal { get; set; }

        /// <summary>
        /// The number of decimal places to show for document total amounts.
        /// </summary>
        [JsonProperty("TotalDocument")]
        public int DocumentTotal { get; set; }
    }

}
