using System.Collections.Generic;

namespace CLMLTEMA.MODELS.SAP
{
    /// <summary>
    /// Represents the SAP Tax Withholding model.
    /// </summary>
    public class WithholdingTax
    {
        /// <summary>
        /// Unique code identifying the tax withholding.
        /// </summary>
        public string WTCode { get; set; }

        /// <summary>
        /// Name of the tax withholding.
        /// </summary>
        public string WTName { get; set; }

        /// <summary>
        /// Tax withholding rate as a percentage.
        /// </summary>
        public decimal Rate { get; set; }

        /// <summary>
        /// Category of the tax withholding.
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// Base type used for calculating the withholding tax.
        /// </summary>
        public string BaseType { get; set; }

        /// <summary>
        /// Percentage of the base amount to be used for tax calculation.
        /// </summary>
        public decimal PrctBsAmnt { get; set; }

        /// <summary>
        /// Official code assigned to the tax withholding.
        /// </summary>
        public string OffclCode { get; set; }

        /// <summary>
        /// General ledger account associated with the tax withholding.
        /// </summary>
        public string Account { get; set; }

        /// <summary>
        /// Define the type of withholding
        /// </summary>
        public string WithholdingType { get; set; }

        /// <summary>
        /// Indicates whether the tax withholding is inactive ("Y" for inactive, "N" for active).
        /// </summary>
        public string Inactive { get; set; }
    }
    
    /// <summary>
    /// Represents a tax withholding code.
    /// </summary>
    public class WithholdingTaxCode
    {
        /// <summary>
        /// Unique code identifying the tax withholding.
        /// </summary>
        public string WTCode { get; set; }

        /// <summary>
        /// Gets or sets the list of user-defined fields represented by the Udf class.
        /// </summary>
        public List<CL.STRUCTURES.CLASSES.Udf.Udf> Udfs { get; set; }
    }
    
    /// <summary>
    /// Represents a tax withholding associated with a specific business partner.
    /// Inherits from the <see cref="WithholdingTax"/> class.
    /// </summary>
    public class WithholdingTaxByBP: WithholdingTax
    {
        /// <summary>
        /// Unique code identifying the tax withholding.
        /// </summary>
        public string CardCode { get; set; }
    }
}