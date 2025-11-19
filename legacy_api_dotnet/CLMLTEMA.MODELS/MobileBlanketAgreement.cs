using System;
using System.Collections.Generic;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents a mobile blanket agreement.
    /// </summary>
    public class MobileBlanketAgreement
    {
        /// <summary>
        /// Gets or sets the AbsID of the mobile blanket agreement.
        /// </summary>
        public int AbsID { get; set; }

        /// <summary>
        /// Gets or sets the CardCode associated with the agreement.
        /// </summary>
        public string CardCode { get; set; }

        /// <summary>
        /// Gets or sets the business partner type (BpType) of the agreement.
        /// </summary>
        public string BpType { get; set; }

        /// <summary>
        /// Gets or sets the start date of the agreement.
        /// </summary>
        public DateTime StartDate { get; set; }

        /// <summary>
        /// Gets or sets the end date of the agreement.
        /// </summary>
        public DateTime EndDate { get; set; }

        /// <summary>
        /// Gets or sets the termination date of the agreement, if applicable.
        /// </summary>
        public DateTime? TerminationDate { get; set; }

        /// <summary>
        /// Gets or sets the description of the agreement.
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Gets or sets the type of the agreement.
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// Gets or sets the payment method (PayMethod) of the agreement.
        /// </summary>
        public string PayMethod { get; set; }

        /// <summary>
        /// Gets or sets the status of the agreement.
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        /// Gets or sets the list of lines (MobileBlanketAgreementDetail) associated with the agreement.
        /// </summary>
        public List<MobileBlanketAgreementDetail> Lines { get; set; }

        /// <summary>
        /// Gets or sets the method of the agreement.
        /// </summary>
        public string Method { get; set; }
    }
}