namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents a cash closing summary with various payment methods and user metadata.
    /// </summary>
    public class CashClosing
    {
        /// <summary>
        /// Currency used in the transaction (e.g., USD, COL).
        /// </summary>
        public string Currency { get; set; }

        /// <summary>
        /// Total cash amount.
        /// </summary>
        public string CashAmount { get; set; }

        /// <summary>
        /// Total card amount.
        /// </summary>
        public string CardAmount { get; set; }

        /// <summary>
        /// Total bank transfer amount.
        /// </summary>
        public string TransferAmount { get; set; }

        /// <summary>
        /// Card amount paid via Pinpad in Costa Rican colón (COL).
        /// </summary>
        public string CardPinpadAmountCOL { get; set; }

        /// <summary>
        /// Card amount paid via Pinpad in US dollars (USD).
        /// </summary>
        public string CardPinpadAmountUSD { get; set; }

        /// <summary>
        /// User's email address.
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Device or user license identifier.
        /// </summary>
        public string License { get; set; }

        /// <summary>
        /// User's digital signature.
        /// </summary>
        public string UserSignature { get; set; }

        /// <summary>
        /// Exchange rate used during the closing.
        /// </summary>
        public string ExchangeRate { get; set; }
    }
}