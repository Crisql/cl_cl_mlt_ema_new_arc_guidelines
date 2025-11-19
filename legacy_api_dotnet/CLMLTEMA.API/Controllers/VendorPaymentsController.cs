using CL.COMMON;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;
using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS.SAP;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class VendorPaymentsController : ApiController
    {
        public async Task<HttpResponseMessage> Post(IncomingPayment _incomingPayment)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IncomingPayment> oCLContext = await Process.PostOutgoingPayments(_incomingPayment);

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
