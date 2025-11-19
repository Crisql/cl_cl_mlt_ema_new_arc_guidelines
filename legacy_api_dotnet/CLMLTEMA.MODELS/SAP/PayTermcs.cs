namespace CLMLTEMA.MODELS.SAP
{
    /// <summary>
    /// Class is used to map the payment terms model
    /// </summary>
    public class PayTerm
    {
        /// <summary>
        /// Identifier for payment terms
        /// </summary>
        public int GroupNum { get; set; }

        /// <summary>
        /// Group for payment terms
        /// </summary>
        public string PymntGroup { get; set; }

        /// <summary>
        /// type for payment terms
        /// </summary>
        public int Type { get; set; }

        /// <summary>
        /// Months in which payment terms are specified
        /// </summary>
        public int Months { get; set; }

        /// <summary>
        /// Days on which payment terms are finalized
        /// </summary>
        public int Days { get; set; }
    }
}