namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents a basic user credential with username and password.
    /// </summary>
    public class Credential
    {
        /// <summary>
        /// Username or login identifier.
        /// </summary>
        public string User { get; set; }

        /// <summary>
        /// Password for authentication.
        /// </summary>
        public string Password { get; set; }
    }
}