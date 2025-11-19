namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Represent the model of mobile measurement units
    /// </summary>
    public class MobileMeasurementUnit
    {
        /// <summary>
        /// Unique identifier of the measurement unit group
        /// </summary>
        public int UgpEntry { get; set; }
        /// <summary>
        /// Code of the measurement unit group
        /// </summary>
        public string GroupCode { get; set; }
        /// <summary>
        /// Name of the measurement unit group
        /// </summary>
        public string GroupName { get; set; }
        /// <summary>
        /// Unique identifier of the measurement unit
        /// </summary>
        public int UoMEntry { get; set; }
        /// <summary>
        /// Code of the measurement unit
        /// </summary>
        public string UoMCode { get; set; }
        /// <summary>
        /// Name of the measurement unit
        /// </summary>
        public string MeasureUnit { get; set; }
        /// <summary>
        /// The quantity of items that represent this measurement unit
        /// </summary>
        public decimal BaseQty { get; set; }
    }
}