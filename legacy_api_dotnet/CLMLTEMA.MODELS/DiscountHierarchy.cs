using CL.STRUCTURES.CLASSES.PresentationEntities;
using CL.STRUCTURES.INTERFACES;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represents a discount hierarchy definition for a company.
    /// </summary>
    public class DiscountHierarchy : BaseEntity, IClDatabaseServices
    {
        /// <summary>
        /// Discount type identifier.
        /// </summary>
        public int Type { get; set; }

        /// <summary>
        /// Hierarchy level of the discount rule.
        /// </summary>
        public int Hierarchy { get; set; }

        /// <summary>
        /// Description of the discount hierarchy.
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Associated company ID.
        /// </summary>
        public int CompanyId { get; set; }

        /// <summary>
        /// Navigation property for the associated company.
        /// </summary>
        public Company Company { get; set; }
    }

    /// <summary>
    /// Defines constants representing types of business partner groups for discount rules.
    /// </summary>
    public static class TypesOfDiscountGrups
    {
        /// <summary>
        /// All business partners.
        /// </summary>
        public const string ALL_BPs = "A";

        /// <summary>
        /// Business partner customer group.
        /// </summary>
        public const string CUSTOMER_GROUP = "C";

        /// <summary>
        /// Business partner vendor group.
        /// </summary>
        public const string VENDOR_GROUP = "V";

        /// <summary>
        /// Specific business partner.
        /// </summary>
        public const string SPECIFIC_BP = "S";
    }

    /// <summary>
    /// Defines constants representing object types for discount applications.
    /// </summary>
    public static class ObjectsType
    {
        /// <summary>
        /// Item group.
        /// </summary>
        public const string ITEM_GROUPS = "52";

        /// <summary>
        /// Item properties.
        /// </summary>
        public const string ITEM_PROPERTIES = "8";

        /// <summary>
        /// Individual item.
        /// </summary>
        public const string ITEM = "4";
    }

    /// <summary>
    /// Enumerates the supported types of discount hierarchy.
    /// </summary>
    public enum TypesOfDiscountHierarchy
    {
        /// <summary>
        /// Discount by business partner.
        /// </summary>
        BUSINESSPARTNER = 1,

        /// <summary>
        /// Discount by item group.
        /// </summary>
        ITEM_GROUP = 2,

        /// <summary>
        /// Customer group by item group.
        /// </summary>
        CUSTOMER_GROUP_BY_ITEM_GROUP = 3,

        /// <summary>
        /// Customer group by item.
        /// </summary>
        CUSTOMER_GROUP_BY_ITEM = 4,

        /// <summary>
        /// Customer by item group.
        /// </summary>
        CUSTOMER_BY_ITEM_GROUP = 5,

        /// <summary>
        /// Customer by item.
        /// </summary>
        CUSTOMER_BY_ITEM = 6,

        /// <summary>
        /// Customer by item family.
        /// </summary>
        CUSTOMER_BY_ITEM_FAMILY = 7,

        /// <summary>
        /// Global sales agreements.
        /// </summary>
        GLOBAL_SALES_AGREEMENTS = 8
    }

    /// <summary>
    /// Defines constants representing discount relation types for business partners.
    /// </summary>
    public static class TypesRelPayForBp
    {
        /// <summary>
        /// Use the lowest discount available.
        /// </summary>
        public const string LOWEST_DISCOUNT = "L";

        /// <summary>
        /// Use the highest discount available.
        /// </summary>
        public const string HIGHEST_DISCOUNT = "H";

        /// <summary>
        /// Use the average of all applicable discounts.
        /// </summary>
        public const string AVERAGE = "A";

        /// <summary>
        /// Use the sum of all applicable discounts.
        /// </summary>
        public const string TOTAL = "S";

        /// <summary>
        /// Apply multiple discount rules (combined).
        /// </summary>
        public const string DISCOUNT_MULTIPLES = "M";
    }
}