using System;
using System.ComponentModel.DataAnnotations.Schema;
using CL.STRUCTURES.CLASSES.LocalEntities;
using CL.STRUCTURES.INTERFACES;

namespace CLMLTEMA.MODELS
{
    public enum ClaimKey
    { 
        UserId,
        ClientId,
        UserEmail
    }

    public class User : CLUser, IClDatabaseServices
    {
        public bool UseScheduling { get; set; }
        public int EmailType { get; set; }
        public string EmailPassword { get; set; }
        public string SchedulingEmail { get; set; }
        public string TokenRecovery { get; set; }
        public DateTime TokenRecoveryEndDate { get; set; }
        
    }

    public class UserAssign : CLAssignment, IClDatabaseServices
    {
        public int CompanyId { get; set; }
        public int UserId { get; set; }
        public int LicenseId { get; set; }

        public User User { get; set; }
        public Company Company { get; set; }
        public License License { get; set; }
        
        /// <summary>
        /// Set or update the sales business partner code.
        /// </summary>
        public string SellerCode { get; set; }

        /// <summary>
        /// Set or update the purchasing business partner code.
        /// </summary>
        public string BuyerCode { get; set; }
    }

    public class UserForRouteTemplate
    {
        public int AssignId { get; set; }
        public string UserEmail { get; set; }
    }

    /// <summary>
    /// model for mapping mobile users
    /// </summary>
    [NotMapped]
    public class MobileUser: User
    {
        public int UserAssignId { get; set; }
        public int CompanyId { get; set; }
        public string SlpCode { get; set; }
        public string SlpName { get; set; }
        public string WhsCode { get; set; }
        public string CenterCost { get; set; }
        public decimal Discount { get; set; }
        /// <summary>
        /// Set or update the sales business partner code.
        /// </summary>
        public string SellerCode { get; set; }

        /// <summary>
        /// Set or update the purchasing business partner code.
        /// </summary>
        public string BuyerCode { get; set; }
    }
}
