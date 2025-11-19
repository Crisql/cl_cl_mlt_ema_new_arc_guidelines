using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Web.Http;
using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CL.STRUCTURES.CLASSES.SAP;
using CLMLTEMA.MODELS;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class StructuresController : ApiController
    {
        // GET
        public HttpResponseMessage Get()
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Get structures KeyValue by his type
        /// </summary>
        /// <param name="structType">Support the next values: DocStates, DocTypesForSearchDocs, RouteTypes</param>
        /// <returns></returns>
        [Route("api/Structures/{structType}")]
        public HttpResponseMessage Get(string structType)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<Structures>> oCLContext = PROCESS.Process.GetStructureByType(structType);

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