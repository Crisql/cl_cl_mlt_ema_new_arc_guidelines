using CL.STRUCTURES.CLASSES.PresentationEntities;
using CL.STRUCTURES.INTERFACES;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// It represents the model for FE series 
    /// </summary>
    public class FESerie: BaseEntity, IClDatabaseServices
    {
        /// <summary>
        /// Name assigned to the series
        /// </summary>
        public string SerieName { get; set; }
        /// <summary>
        /// Number of the BranchOffice
        /// </summary>
        public int BranchOffice { get; set; }
        /// <summary>
        /// Number of the terminal
        /// </summary>
        public int Terminal { get; set; }
        /// <summary>
        /// Next number of the series
        /// </summary>
        public int NextNumber { get; set; }
        
        /// <summary>
        /// Id of the series per user to which it relates
        /// </summary>
        public int SeriesByUserId { get; set; }
        
        /// <summary>
        /// Relationship to the Series Entity by User
        /// </summary>
        public SeriesByUser SeriesByUser { get; set; }
    }
}