using CL.STRUCTURES.INTERFACES;
using CL.STRUCTURES.CLASSES.LocalEntities;
using CL.STRUCTURES.CLASSES.PresentationEntities;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents a database resource configuration.
    /// Inherits base properties from <see cref="CLDBResource"/>.
    /// </summary>
    public class DBResource : CLDBResource, IClDatabaseServices
    {
    }

    /// <summary>
    /// Represents a resource type with a description and identifier.
    /// </summary>
    public class DBResourceType
    {
        /// <summary>
        /// Description of the resource type.
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Type identifier (e.g., QS, SW, etc.).
        /// </summary>
        public string Type { get; set; }
    }

    /// <summary>
    /// Represents a database resource linked to a specific company.
    /// Inherits base properties from <see cref="CLDBResource"/>.
    /// </summary>
    public class DBResourceWithCompany : CLDBResource, IClDatabaseServices
    {
        /// <summary>
        /// Company ID that owns the resource.
        /// </summary>
        public int CompanyId { get; set; }
    }

    /// <summary>
    /// Represents the association between a company and a specific database resource.
    /// </summary>
    public class ResourcesByCompany : BaseEntity
    {
        /// <summary>
        /// Record ID.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Associated database resource ID.
        /// </summary>
        public int DBResourceId { get; set; }

        /// <summary>
        /// Associated company ID.
        /// </summary>
        public int CompanyId { get; set; }

        /// <summary>
        /// Name of the target database object (e.g., table or view).
        /// </summary>
        public string DBObject { get; set; }

        /// <summary>
        /// Custom query string used for data access.
        /// </summary>
        public string QueryString { get; set; }

        /// <summary>
        /// Number of records to return per page.
        /// </summary>
        public int PageSize { get; set; }

        /// <summary>
        /// Navigation property for the associated database resource.
        /// </summary>
        public DBResource DbResource { get; set; }

        /// <summary>
        /// Navigation property for the associated company.
        /// </summary>
        public Company Company { get; set; }
    }
}
