using Newtonsoft.Json;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represent the model of mobile change information
    /// </summary>
    public class MobileChangeInformation
    {
        /// <summary>
        /// Type of changed information. 
        /// </summary>
        /// <remarks>
        /// Use MobileChangeInformationType static class
        /// </remarks>
        public string Type { get; set; }
        /// <summary>
        /// Number of changed information
        /// </summary>
        public int Count { get; set; }
    }
}