namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represent the details of the blanket agreements
    /// </summary>
    public class MobileBlanketAgreementDetail
    {
       /// <summary>
       /// Blanket agreement unique identifier
       /// </summary>
        public int AbsID { get; set; }
       /// <summary>
       /// The item where this blanket agreement should be applied
       /// </summary>
        public string ItemCode { get; set; }
       /// <summary>
       /// Item group of the item where this blanket agreement should be applied
       /// </summary>
        public int? ItemGroup { get; set; }
       /// <summary>
       /// Item price defined by blanket agreement
       /// </summary>
        public decimal UnitPrice { get; set; }
       /// <summary>
       /// Currency of the item price defined by blanket agreement
       /// </summary>
        public string Currency { get; set; }
       /// <summary>
       /// Required quantity of the ite, to apply the blanket agreement
       /// </summary>
        public decimal PlanQty { get; set; }
       /// <summary>
       /// Required discount of the ite, to apply the blanket agreement
       /// </summary>
       public decimal Discount { get; set; }
    }
}