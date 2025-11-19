using System.Collections.Generic;

namespace CLMLTEMA.MODELS.SAP
{
    public class Dimension
    {
        public int DimCode {get; set;}
        public string DimName {get; set;}
        public char DimActive {get; set;}
        public string DimDesc {get; set;}
        public List<DistributionRules> DistributionRulesList {get; set;}
    }
}