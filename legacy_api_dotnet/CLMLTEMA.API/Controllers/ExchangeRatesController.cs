using CL.COMMON;
using CLMLTEMA.PROCESS;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.MODELS.SAP;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class ExchangeRatesController : ApiController
    {
        /// <summary>
        /// Handles a GET request to retrieve the current exchange rate.
        /// </summary>
        /// <returns>
        /// An HTTP response containing the exchange rate or an error message if the operation fails.
        /// </returns>
        public async Task<HttpResponseMessage> Get()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<ExchangeRate> oCLContext = await Process.GetExchangeRate();

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

        /// <summary>
        /// Handles a GET request to retrieve the upcoming exchange rates.
        /// </summary>
        /// <returns>
        /// An HTTP response with a list of upcoming exchange rates or an error message if the operation fails.
        /// </returns>
        [Route("api/ExchangeRates/UpcomingExchangeRate")]
        public async Task<HttpResponseMessage> GetUpcomingExchangeRate()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<UpcomingExchangeRate>> oCLContext = await Process.GetUpcomingExchangeRate();

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