using CL.STRUCTURES.CLASSES.PresentationEntities;
using CL.STRUCTURES.INTERFACES;
using System.ComponentModel.DataAnnotations.Schema;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents a series assigned to a user in the database
    /// </summary>
    public class SeriesByUser : BaseEntity, IClDatabaseServices
    {
        /// <summary>
        /// ID of the user to whom the series is assigned.
        /// </summary>
        public int UserAssingId { get; set; }
    
        /// <summary>
        /// ID of the company associated with the series.
        /// </summary>
        public int CompanyId { get; set; }
    
        /// <summary>
        /// Serial number of the series.
        /// </summary>
        public int NoSerie { get; set; }
    
        /// <summary>
        /// Type of document associated with the series.
        /// </summary>
        public string DocumentType { get; set; }
    
        /// <summary>
        /// Type of the series.
        /// </summary>
        public int SerieType { get; set; } = 0;
    
        /// <summary>
        /// Description of the series.
        /// </summary>
        public string SerieDescription { get; set; }
    
        /// <summary>
        /// User to whom the series is assigned.
        /// </summary>
        public UserAssign UserAssing { get; set; }
    
        /// <summary>
        /// Company associated with the series.
        /// </summary>
        public Company Company { get; set; }
    
        /// <summary>
        /// Indicates whether the series is serial.
        /// </summary>
        public bool IsSerial { get; set; }
    
        // Private member to track the activation status of the series.
        private bool IsActive { get; set; }
    }

    /// <summary>
    /// Model representing the configuration of a series with FE series
    /// </summary>
    public class SeriesByUserWithFESerie
    {
        public SeriesByUser SeriesByUser { get; set; }
        public FESerie FESerie { get; set; }
    }


    /// <summary>
    /// Model for mapping mobile users with their series
    /// </summary>
   [NotMapped]
    public class MobileUserSeries: SeriesByUser
    {
        public FESerie FESerie { get; set; }
    }

    [NotMapped]
    public class UpdateFESerie
    {
        /// <summary>
        /// ID of the company associated with the series.
        /// </summary>
        public int CompanyId { get; set; }

        /// <summary>
        /// Serial number of the series.
        /// </summary>
        public int NoSerie { get; set; }
        /// <summary>
        /// ID of the user to whom the series is assigned.
        /// </summary>
        public int UserAssingId { get; set; }

        /// <summary>
        /// Type of document associated with the series.
        /// </summary>
        public int DocumentType { get; set; }

        /// <summary>
        /// Next number of the series
        /// </summary>
        public int NextNumber { get; set; }
    }


}