using System;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// This class is used to mapping marketing document to activities
    /// </summary>
    public class DocumentsActivities
    {
        /// <summary>
        /// internal document
        /// </summary>
        public int DocEntry { get; set; }

        /// <summary>
        /// number document
        /// </summary>
        public int DocNum { get; set; }

        /// <summary>
        /// Document Date
        /// </summary>
        public DateTime DocDate { get; set; }

        /// <summary>
        /// Name of business parther
        /// </summary>
        public string CardName { get; set; }

        /// <summary>
        /// Document comments
        /// </summary>
        public string Comments { get; set; }
    }
}