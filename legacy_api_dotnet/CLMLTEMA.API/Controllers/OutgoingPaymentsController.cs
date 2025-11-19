using CL.COMMON;
using CLMLTEMA.PROCESS;
using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS.SAP;

namespace CLMLTEMA.API.Controllers
{
    [System.Web.Mvc.Authorize]
    [CompanyBinderActionFilter]
    public class OutgoingPaymentsController : ApiController
    {
        public async Task<HttpResponseMessage> Post(IncomingPayment outgoingPayment)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IncomingPayment> oCLContext = await Process.PostOutgoingPayments(outgoingPayment);

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