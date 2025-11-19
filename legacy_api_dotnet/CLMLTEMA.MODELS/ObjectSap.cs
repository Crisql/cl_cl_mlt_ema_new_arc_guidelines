using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CLMLTEMA.MODELS
{
    /// <summary>
    /// Class representing an object in SAP.
    /// </summary>
    public class ObjectSap
    {
        /// <summary>
        /// Unique code of the object.
        /// </summary>
        public string ObjectCode { get; set; }
    
        /// <summary>
        /// Name of the table associated with the object.
        /// </summary>
        public string TableName { get; set; }
    
        /// <summary>
        /// Description of the table associated with the object.
        /// </summary>
        public string TableDescription { get; set; }
    }

    /// <summary>
    /// Class representing a series in SAP.
    /// </summary>
    public class SeriesSAP
    {
        /// <summary>
        /// Series number.
        /// </summary>
        public int Serie { get; set; }
    
        /// <summary>
        /// Name of the series.
        /// </summary>
        public string SerieName { get; set; }
    }

}
