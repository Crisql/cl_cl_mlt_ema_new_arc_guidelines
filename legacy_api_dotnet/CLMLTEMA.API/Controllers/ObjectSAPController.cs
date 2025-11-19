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
    [Authorize]
    [CompanyBinderActionFilter]
    public class ObjectSAPController : ApiController
    {
        public HttpResponseMessage Get()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<ObjectSap>> oCLContext = Process.GetObject();

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