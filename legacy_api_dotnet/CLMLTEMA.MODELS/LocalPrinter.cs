using System.ComponentModel.DataAnnotations;
using CL.STRUCTURES.CLASSES.PresentationEntities;
using CL.STRUCTURES.INTERFACES;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents a local printer configuration assigned to a specific user.
    /// </summary>
    public class LocalPrinter : BaseEntity, IClDatabaseServices
    {
        /// <summary>
        /// Unique identifier for the printer configuration.
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Identifier of the user to whom the printer is assigned.
        /// </summary>
        public int UserAssingId { get; set; }

        /// <summary>
        /// Indicates whether local printing is enabled for this user.
        /// </summary>
        public bool UseLocalPrint { get; set; }

        /// <summary>
        /// Name of the printing method or port service used for communication.
        /// </summary>
        public string PortServicePrintMethod { get; set; }

        /// <summary>
        /// Name of the selected printer.
        /// </summary>
        public string PrinterName { get; set; }

        /// <summary>
        /// Navigation property to the user assignment.
        /// </summary>
        public UserAssign UserAssing { get; set; }
    }

    /// <summary>
    /// Represents a selected printer configuration for a specific user.
    /// </summary>
    public class SelectedPrinterName : IClDatabaseServices
    {
        /// <summary>
        /// The name of the selected printer.
        /// </summary>
        public string PrinterName { get; set; }

        /// <summary>
        /// The ID of the user assignment associated with this printer.
        /// </summary>
        public int UserAssingId { get; set; }

        /// <summary>
        /// The user who last updated the printer configuration.
        /// </summary>
        public string UpdatedBy { get; set; }
    }
}