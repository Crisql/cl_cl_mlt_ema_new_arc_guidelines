namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Model of a query simulated conditions for approvals
    /// </summary>
    public class QueryCondition
    {
        /// <summary>
        /// Value used to filter with the approval filter conditions defined in the settings
        /// </summary>
        public string FilterBy { get; set; }
        /// <summary>
        /// Value to validate with the document object in the stored procedure
        /// </summary>
        public string Value { get; set; }
        /// <summary>
        /// Represent the name of the condition and also is the identifier of the conditions
        /// </summary>
        public string Condition { get; set; }

        /// <summary>
        /// Represents the identifier of the authorization model that was applied
        /// </summary>
        public int WtmCode { get; set; }
    }


    /// <summary>
    /// Represents a conditional flag used to determine whether a query condition should be applied
    /// when building dynamic queries or filters.
    /// </summary>
    public class QueryConditionApply
    {
        /// <summary>
        /// Indicates whether the associated query condition should be applied.
        /// </summary>
        public bool IsApply { get; set; }

        /// <summary>
        /// The query condition to be evaluated or applied if <see cref="IsApply"/> is true.
        /// </summary>
        public QueryCondition QueryCondition { get; set; }
    }
}