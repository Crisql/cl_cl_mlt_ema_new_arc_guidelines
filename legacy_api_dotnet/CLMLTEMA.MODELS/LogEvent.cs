using System;
using CL.STRUCTURES.CLASSES.PresentationEntities;
using CL.STRUCTURES.INTERFACES;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents a log entry for a specific user or system event.
    /// </summary>
    public class LogEvent : BaseEntity, IClDatabaseServices
    {
        /// <summary>
        /// Type or name of the event that occurred.
        /// </summary>
        public string Event { get; set; }

        /// <summary>
        /// View or screen where the event took place.
        /// </summary>
        public string View { get; set; }

        /// <summary>
        /// Additional details or description of the event.
        /// </summary>
        public string Detail { get; set; }

        /// <summary>
        /// Unique document key related to the event, if applicable.
        /// </summary>
        public string DocumentKey { get; set; }
    }

    /// <summary>
    /// Represents a filter used for querying logged events.
    /// </summary>
    public class LogEventFilter
    {
        /// <summary>
        /// General search term to filter events by.
        /// </summary>
        public string Filter { get; set; }

        /// <summary>
        /// Specific event name to filter.
        /// </summary>
        public string Event { get; set; }

        /// <summary>
        /// Start date for the time range filter.
        /// </summary>
        public DateTime From { get; set; }

        /// <summary>
        /// End date for the time range filter.
        /// </summary>
        public DateTime To { get; set; }

        /// <summary>
        /// Number of records to skip (for pagination).
        /// </summary>
        public int Skip { get; set; }

        /// <summary>
        /// Number of records to take (for pagination).
        /// </summary>
        public int Take { get; set; }
    }
}