using CL.COMMON;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.STRUCTURES.CLASSES.Rebound;
using CL.STRUCTURES.CLASSES.SAP;
using CLMLTEMA.MODELS.SAP;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class DimensionController : ApiController
    {
        public async Task<HttpResponseMessage> Get()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<Dimension>> oCLContext = await Process.GetDimensions();

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