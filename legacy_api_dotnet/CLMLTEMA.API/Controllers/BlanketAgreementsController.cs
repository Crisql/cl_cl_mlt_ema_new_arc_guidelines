using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON;
using CL.COMMON.ActionFilters;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using Process = CLMLTEMA.PROCESS.Process;

namespace CLMLTEMA.API.Controllers
{
    /// <summary>
    /// Controller for managing blanket agreements.
    /// </summary>
    [Authorize]
    [CompanyBinderActionFilter]
    public class BlanketAgreementsController : ApiController
    {
        /// <summary>
        /// Retrieves blanket agreements for a specific card code.
        /// </summary>
        /// <param name="CardCode">The card code used to retrieve blanket agreements.</param>
        /// <returns>An asynchronous task that returns an HttpResponseMessage with the blanket agreements.</returns>
        [HttpGet]
        [QueryStringExposer]
        public async Task<HttpResponseMessage> Get(string CardCode)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<MobileBlanketAgreement>> oClContext = await Process.GetBlanketAgreements(CardCode);

                LogManager.Record("CONTROLLER ENDED UP");

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