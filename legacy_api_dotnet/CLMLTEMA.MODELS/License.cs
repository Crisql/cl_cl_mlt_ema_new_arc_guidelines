using CL.STRUCTURES.CLASSES.LocalEntities;
using CL.STRUCTURES.INTERFACES;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents a license associated with a specific company.
    /// Inherits base properties from <see cref="CLLicense"/>.
    /// </summary>
    public class License : CLLicense, IClDatabaseServices
    {
        /// <summary>
        /// Identifier of the company that owns the license.
        /// </summary>
        public int CompanyId { get; set; }

        /// <summary>
        /// Navigation property to the associated company.
        /// </summary>
        public Company Company { get; set; }
    }
}