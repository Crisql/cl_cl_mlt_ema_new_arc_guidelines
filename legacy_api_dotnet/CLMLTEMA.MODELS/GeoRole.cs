using System.ComponentModel.DataAnnotations;
using CL.STRUCTURES.CLASSES.PresentationEntities;
using CL.STRUCTURES.INTERFACES;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents a geographic role used to define user or configuration access to regions.
    /// </summary>
    public class GeoRole : BaseEntity, IClDatabaseServices
    {
        /// <summary>
        /// Name of the geographic role (e.g., "Regional Manager").
        /// </summary>
        public string Name { get; set; }
    }

    /// <summary>
    /// Represents the relationship between a geographic configuration and a geographic role.
    /// </summary>
    public class GeoConfigByGeoRole : BaseEntity
    {
        /// <summary>
        /// Identifier of the geographic configuration.
        /// </summary>
        public int GeoConfigId { get; set; }

        /// <summary>
        /// Identifier of the geographic role.
        /// </summary>
        public int GeoRoleId { get; set; }

        /// <summary>
        /// Geographic role navigation property.
        /// </summary>
        public GeoRole GeoRole { get; set; }

        /// <summary>
        /// Geographic configuration navigation property.
        /// </summary>
        public GeoConfig GeoConfig { get; set; }
    }

    /// <summary>
    /// Represents the assignment of a geographic role to a user within a company.
    /// </summary>
    public class GeoRoleByUser : BaseEntity
    {
        /// <summary>
        /// User identifier.
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Company identifier.
        /// </summary>
        public int CompanyId { get; set; }

        /// <summary>
        /// Geographic role identifier.
        /// </summary>
        public int GeoRoleId { get; set; }

        /// <summary>
        /// Geographic role navigation property.
        /// </summary>
        public GeoRole GeoRole { get; set; }

        /// <summary>
        /// Company navigation property.
        /// </summary>
        public Company Company { get; set; }

        /// <summary>
        /// User navigation property.
        /// </summary>
        public User User { get; set; }
    }
}