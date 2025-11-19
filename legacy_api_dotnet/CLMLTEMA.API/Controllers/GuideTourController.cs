using System;
using System.Net.Http;
using System.Web.Http;
using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class GuideTourController: ApiController
    {
        public HttpResponseMessage Get(string routeView)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<GuideTour> oCLContext = Process.GetGuideTour(routeView);

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