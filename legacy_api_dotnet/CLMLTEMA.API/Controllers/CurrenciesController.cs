using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [System.Web.Mvc.Authorize]
    [CompanyBinderActionFilter]
    public class CurrenciesController : ApiController
    {
        /// <summary>
        /// Retrieve a list of available currencies.
        /// </summary>
        /// <param name="IncludeAllCurrencies">
        /// If <c>true</c>, includes all currencies in the result. If <c>false</c>, excludes the configured "All Currencies Symbol".
        /// </param>
        /// <returns>
        /// An <see cref="HttpResponseMessage"/> containing the list of currencies wrapped in a response context.
        /// </returns>
        public async Task<HttpResponseMessage> Get(bool IncludeAllCurrencies)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<TypeCurrency>> oCLContext = await Process.GetCurrencies(IncludeAllCurrencies);

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