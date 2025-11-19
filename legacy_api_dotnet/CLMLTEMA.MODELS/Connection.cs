using CL.STRUCTURES.CLASSES.LocalEntities;
using CL.STRUCTURES.INTERFACES;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents a database connection configuration.
    /// Inherits base properties from <see cref="CLConnection"/>.
    /// </summary>
    public class Connection : CLConnection, IClDatabaseServices
    {
    }
}
