using CL.STRUCTURES.CLASSES.LocalEntities;
using CL.STRUCTURES.INTERFACES;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents a company with an associated database connection.
    /// </summary>
    public class Company : CLCompany, IClDatabaseServices
    {
        /// <summary>
        /// Identifier for the associated connection.
        /// </summary>
        public int ConnectionId { get; set; }

        /// <summary>
        /// Connection details for the company.
        /// </summary>
        public Connection Connection { get; set; }
    }
}
