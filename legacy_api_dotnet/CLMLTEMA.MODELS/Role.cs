using System.ComponentModel.DataAnnotations;
using CL.STRUCTURES.CLASSES.LocalEntities;
using CL.STRUCTURES.CLASSES.PresentationEntities;
using CL.STRUCTURES.INTERFACES;

namespace CLMLTEMA.MODELS
{
    public class Role : CLRole, IClDatabaseServices
    {

    }

    public class PermsByRole : BaseEntity
    {
        public int PermissionId { get; set; }
        public int RoleId { get; set; }

        public Role Role { get; set; }
        public Permission Permission { get; set; }
    }

    public class RolesByUser : BaseEntity
    {
        public int UserId { get; set; }
        public int CompanyId { get; set; }
        public int RoleId { get; set; }

        public Role Role { get; set; }
        public Company Company { get; set; }
        public User User { get; set; }
    }
}
