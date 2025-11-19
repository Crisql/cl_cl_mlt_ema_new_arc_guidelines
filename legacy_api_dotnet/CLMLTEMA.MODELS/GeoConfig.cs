using CL.STRUCTURES.CLASSES.PresentationEntities;
using CL.STRUCTURES.INTERFACES;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents a geographic configuration entity (e.g., region, zone).
    /// </summary>
    public class GeoConfig : BaseEntity, IClDatabaseServices
    {
        /// <summary>
        /// Unique key for the geographic configuration.
        /// </summary>
        public int Key { get; set; }

        /// <summary>
        /// Name or label of the configuration (e.g., "North Zone").
        /// </summary>
        public string Name { get; set; }
    }
}