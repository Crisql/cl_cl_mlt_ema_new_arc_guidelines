namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents a mobile account with its name, identifier, and currency.
    /// </summary>
    public class MobileAccount
    {
        /// <summary>
        /// The display name of the account.
        /// </summary>
        public string AccountName { get; set; }

        /// <summary>
        /// The unique identifier or number of the account.
        /// </summary>
        public string Account { get; set; }

        /// <summary>
        /// The currency associated with the account (e.g., USD, CRC).
        /// </summary>
        public string Currency { get; set; }
    }
}