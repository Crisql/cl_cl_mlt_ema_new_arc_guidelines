using CL.STRUCTURES.CLASSES.SAP;

namespace CLMLTEMA.MODELS.SAP
{
    public class Accounts :Account
    {
        public int Id { get; set; } 
    }
    
    public class AccountsFilter
    {
        public string Store { get; set; } 
    }
}