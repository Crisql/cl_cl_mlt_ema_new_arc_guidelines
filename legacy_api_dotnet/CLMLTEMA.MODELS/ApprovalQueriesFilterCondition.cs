using System.Collections.Generic;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represent the model of an approval query condition filter
    /// </summary>
    public class ApprovalQueriesFilterCondition
    {
        /// <summary>
        /// Name of the condition where the filters will be applied
        /// </summary>
        public string QueryConditionName { get; set; }
        /// <summary>
        /// Conditions that will be applied for the approval query
        /// </summary>
        public List<ApprovalQueriesFilterConditionLine> Conditions { get; set; }
    }

    /// <summary>
    /// Represent the model of the condition for approval queries conditions filter
    /// </summary>
    public class ApprovalQueriesFilterConditionLine
    {
        /// <summary>
        /// Property name of the document that will be used to filter the query conditions
        /// </summary>
        public string DocumentPropertyName { get; set; }
        /// <summary>
        /// Indicates what type of filter will be used to filter the query conditions
        /// </summary>
        /// <seealso cref="CLMLTEMA.COMMON.Constants.ApprovalQueriesFilterConditionType"/>
        public string ConditionType { get; set; }
    }
}