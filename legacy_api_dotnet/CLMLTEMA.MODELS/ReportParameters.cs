using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CLMLTEMA.MODELS
{
    public class ReportParameters
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string UncPath { get; set; }
        public List<ReportParameter> Parameters { get; set; }
    }

    public class ReportParameter
    {
        public string Name { get; set; }
        public object Value { get; set; }
    }
}
