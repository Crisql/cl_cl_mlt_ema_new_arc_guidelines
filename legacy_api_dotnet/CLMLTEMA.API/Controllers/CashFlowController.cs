using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS.SAP;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class CashFlowController : ApiController
    {
        public async Task<HttpResponseMessage> Post(CashFlow _cashFlow)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<CashFlow> oCLContext = await Process.PostCashFlow(_cashFlow);

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