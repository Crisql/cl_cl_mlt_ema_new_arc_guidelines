using System;

namespace CLMLTEMA.MODELS
{
    public class MobileDiscountHierarchy
    {
        public int Id { get; set; }
        public int Type { get; set; }
        public int Hierarchy { get; set; }
        public string Description { get; set; }
        public int CompanyId { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public DateTime UpdateDate { get; set; }
        public string UpdateBy { get; set; }
        public bool IsActive { get; set; }
    }
    
    public class MobileDiscountHierarchyFilter
    {
        public int UserAssignId { get; set; }
        public bool ActivedDiscounts { get; set; }
    }
}