namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// This class is used to model items for the activity screen
    /// </summary>
    public class ItemsActivities
    {
        /// <summary>
        /// This property code of the model
        /// </summary>
        public string Codigo { get; set; }
        
        /// <summary>
        /// This property description of the model
        /// </summary>
        public string Description { get; set; }
        
        /// <summary>
        /// This property activo of the model
        /// </summary>
        public string Activo { get; set; }
        
        /// <summary>
        /// This property available of the model
        /// </summary>
        public decimal OnHand { get; set; }
    }
}