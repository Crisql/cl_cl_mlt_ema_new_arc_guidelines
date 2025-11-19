namespace CLMLTEMA.MODELS
{
    public class MobileTaxCodeDetermination
    {
        public int DocEntry { get; set; }
        public int LineNum { get; set; }
        public string DocType { get; set; }
        public string BusArea { get; set; }
        public string Cond1 { get; set; }
        public string UDFTable1 { get; set; }
        public decimal NumVal1 { get; set; }
        public string StrVal1 { get; set; }
        public decimal MnyVal1 { get; set; }
        public string Cond2 { get; set; }
        public string UDFTable2 { get; set; }
        public decimal NumVal2 { get; set; }
        public string StrVal2 { get; set; }
        public decimal MnyVal2 { get; set; }
        public string Cond3 { get; set; }
        public string UDFTable3 { get; set; }
        public decimal NumVal3 { get; set; }
        public string StrVal3 { get; set; }
        public decimal MnyVal3 { get; set; }
        public string Cond4 { get; set; }
        public string UDFTable4 { get; set; }
        public decimal NumVal4 { get; set; }
        public string StrVal4 { get; set; }
        public decimal MnyVal4 { get; set; }
        public string Cond5 { get; set; }
        public string UDFTable5 { get; set; }
        public decimal NumVal5 { get; set; }
        public string StrVal5 { get; set; }
        public decimal MnyVal5 { get; set; }
        public string Descr { get; set; }
        public string LnTaxCode { get; set; }
        public string FrLnTax { get; set; }
        public string FrHdrTax { get; set; }
        public string UDFAlias1 { get; set; }
        public string UDFAlias2 { get; set; }
        public string UDFAlias3 { get; set; }
        public string UDFAlias4 { get; set; }
        public string UDFAlias5 { get; set; }
    }

    public class MobileConditionTaxCodeDetermination
    {
        public string ItemCode { get; set; }
        public string CardCode { get; set; }
        public string Value { get; set; }
    }

    public class MobileTaxCode
    {
        public string LnTaxCode { get; set; }
    }
}