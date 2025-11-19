using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Web.Http;
using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [CompanyBinderActionFilter]
    [Authorize]
    public class GuideTourStepsController : ApiController
    {
        public HttpResponseMessage Get()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<GuideTourStep>> oClContext = Process.GetGuideTourSteps();
                
                LogManager.Record("CONTROLLER END UP");

                return Core.ContextBroker(oClContext);
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