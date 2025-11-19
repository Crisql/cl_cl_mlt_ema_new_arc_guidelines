using CL.STRUCTURES.CLASSES.Udf;

namespace CLMLTEMA.MODELS
{
    public class CompanyUdf : CLUdf
    {
    }

    public class UdfDevelopment
    {
        public string Key { get; set; }
        public string Name { get; set; }
        public string FieldType { get; set; }
        public string Tables { get; set; }
    }
    
    public class UdfSourceLine : UdfSource
    {
        public string Index { get; set; }
        public string ValueLine { get; set; }
    }
}