using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class TappController : ApiController
    {
        public async Task<HttpResponseMessage> Get(string bridgeId, string invoiceId,
            string invoiceDate, string identification, string userId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<string> oCLContext =
                    await Process.OpenTappInvoice(bridgeId, invoiceId, invoiceDate, identification, userId);

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
        
        public async Task<HttpResponseMessage> Post(TappCloseInvoice tappCloseInvoice)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<TappResponse> oCLContext =
                    await Process.CloseTappInvoice(tappCloseInvoice);

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