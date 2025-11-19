namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents the configuration container for multiple loyalty program integrations.
    /// </summary>
    public class LoyaltyPlan
    {
        /// <summary>
        /// Configuration settings for the Lealto loyalty system.
        /// </summary>
        public LealtoConfigBase Lealto { get; set; }

        /// <summary>
        /// Configuration settings for the Tapp loyalty system.
        /// </summary>
        public TappConfigBase Tapp { get; set; }
    }
}