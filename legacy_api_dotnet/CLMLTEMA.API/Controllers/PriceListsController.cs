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
    public class PriceListsController : ApiController
    {
        /// <summary>
        /// Retrieves a list of price lists based on the specified view type.
        /// </summary>
        /// <param name="ViewType">The type of view to filter the price lists.</param>
        /// <returns>
        /// An HTTP response message containing the list of price lists.
        /// </returns>
        public async Task<HttpResponseMessage> Get(string ViewType)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<PriceList>> oCLContext = await Process.GetPriceLists(ViewType);

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
