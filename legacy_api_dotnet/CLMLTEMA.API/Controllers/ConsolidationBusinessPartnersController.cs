using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS.SAP;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [CompanyBinderActionFilter]
    [Authorize]
    public class ConsolidationBusinessPartnersController: ApiController
    {
        public async Task<HttpResponseMessage> Get(string CardType, string Currency)
        {
            try
            {
                string[] currency = Uri.UnescapeDataString(Currency).Split(',');
                LogManager.Record("CONTROLLER STARTED");
                CLContext<List<BusinessPartners>> oClContext = await Process.GetConsolidationBP(CardType, currency );
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