namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// This class is used to map the list of activities
    /// </summary>
    public class SearchDocumentsActivities
    {
        /// <summary>
        /// Activity code property
        /// </summary>
        public int ActivityCode { get; set; }
        
        /// <summary>
        /// Business partner code property
        /// </summary>
        public string CardCode { get; set; }
        
        /// <summary>
        /// Business partner name property
        /// </summary>
        public string CardName { get; set; }
        
        /// <summary>
        /// Activity creation date property
        /// </summary>
        public string CreateDate { get; set; }
    }
}