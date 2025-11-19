namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents the user context for accessing SAP via ODBC and Service Layer.
    /// </summary>
    public class ClUserContextODBC
    {
        /// <summary>
        /// SAP database code.
        /// </summary>
        public string DBCode { get; set; }

        /// <summary>
        /// Server hosting the SAP database.
        /// </summary>
        public string Server { get; set; }

        /// <summary>
        /// Service Layer URL.
        /// </summary>
        public string SLUrl { get; set; }

        /// <summary>
        /// DST defined on the resource.
        /// </summary>
        public string DST { get; set; }

        /// <summary>
        /// SAP username. Example: CLAVISCO\\cl.desarrollo.sql1
        /// </summary>
        public string License { get; set; }

        /// <summary>
        /// Password for SAP authentication.
        /// </summary>
        public string Password { get; set; }

        /// <summary>
        /// Logged-in user's email address.
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Username used to execute SQL queries.
        /// </summary>
        public string ODBCUser { get; set; }

        /// <summary>
        /// Password for authenticating the SQL query user.
        /// </summary>
        public string ODBCPass { get; set; }

        /// <summary>
        /// ODBC database type.
        /// </summary>
        public string ODBCType { get; set; }

        /// <summary>
        /// Server type.
        /// </summary>
        public string ServerType { get; set; }

        /// <summary>
        /// Name of the resource to be used with Service Layer extensions.
        /// Examples:
        /// - To consume an SQL view: CL_D_EMA_SLT_CURRENCIESB1SqlQuery
        /// - To apply filters: CL_D_EMA_SLT_CURRENCIESB1SqlQuery$filter @Code eq Code
        /// - To create a quotation: Quotations
        /// </summary>
        public string Resource { get; set; }

        /// <summary>
        /// Resource type: QS = QueryString, SW = SAP Writer.
        /// </summary>
        public string ResourceType { get; set; }
    }
}