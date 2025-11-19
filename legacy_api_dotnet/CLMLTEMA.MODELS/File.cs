using System.IO;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents a file with metadata and content in stream or Base64 format.
    /// </summary>
    public class File
    {
        /// <summary>
        /// File name, including extension.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// MIME type or file extension (e.g., application/pdf, image/png).
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// File content as a stream.
        /// </summary>
        public Stream Content { get; set; }

        /// <summary>
        /// File content encoded as a Base64 string.
        /// </summary>
        public string Base64 { get; set; }
    }
}