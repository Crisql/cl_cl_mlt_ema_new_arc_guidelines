using System.ComponentModel.DataAnnotations;
using CL.STRUCTURES.CLASSES.PinPad;
using CL.STRUCTURES.INTERFACES;

namespace CLMLTEMA.MODELS
{
    public class Terminal : CLTerminal, IClDatabaseServices
    {
        public string Password { get; set; }
    }

    public class TerminalsByUser
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }
        public int TerminalId { get; set; }
        public int CompanyId { get; set; }
        public bool IsDefault { get; set; }

        public Terminal Terminal { get; set; }
        public User User { get; set; }
        public Company Company { get; set; }
    }

    public class TerminalUserCompany
    {
        public string TerminalId { get; set; }
        public string Description { get; set; }
        public string Currency { get; set; }
        public string Password { get; set; }
        public bool IsDefault { get; set; }
        public string QuickPayAmount { get; set; }
        public string Status { get; set; }
        public int Id { get; set; }
    }
}
