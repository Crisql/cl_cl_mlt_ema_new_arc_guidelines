using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents the UI context and credentials information for a specific user and resource.
    /// </summary>
    public class ClUserUiContext
    {
        /// <summary>
        /// Gets or sets the server address where the service is hosted.
        /// </summary>
        public string Server { get; set; }

        /// <summary>
        /// Gets or sets the URL of the Service Layer (SL) endpoint.
        /// </summary>
        public string SLUrl { get; set; }

        /// <summary>
        /// Gets or sets the user's email address used for identification or communication.
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Gets or sets the name of the resource the user is interacting with.
        /// </summary>
        public string Resource { get; set; }

        /// <summary>
        /// Gets or sets the type of the resource (e.g., module, service).
        /// </summary>
        public string ResourceType { get; set; }
    }
}
