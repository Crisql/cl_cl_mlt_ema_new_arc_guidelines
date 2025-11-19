using CL.COMMON;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;
using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.STRUCTURES.CLASSES.Rebound;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class GoodsController : ApiController
    {
       
        public async Task<HttpResponseMessage> Post(string document)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<string> oCLContext = await Process.PostPurchaseDeliveryNotes(document);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);

            }
            finally
            {

            }
        }

        [Route("api/Goods/PurchaseReturns")]
        [HttpPost]
        public async Task<HttpResponseMessage> PostPurchaseReturns(string document)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<string> oCLContext = await Process.PostPurchaseReturns(document);

                LogManager.Record("CONTROLLER ENDED UP");

                return Core.ContextBroker(oCLContext);
            }
            catch (Exception ex)
            {
                return Core.ContextBroker(ex);

            }
            finally
            {

            }
        }
    }
}
