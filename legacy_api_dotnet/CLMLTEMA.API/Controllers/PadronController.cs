using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]  
    public class PadronController : ApiController
    {
        public async Task<HttpResponseMessage> Get(string Identification)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<string> oCLContext = await Process.GetPadron(Identification);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);
            }
            finally
            {
                LogManager.Commit(Request);
            }
        }
    }
}
