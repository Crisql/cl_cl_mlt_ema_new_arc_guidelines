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
    public class LealtoController : ApiController
    {
        [Route("~/api/Lealto/{identification}")]
        public async Task<HttpResponseMessage> Get(string identification)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<InfoUserDataUI> oCLContext = await Process.ConsultPoints(identification);

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
        
        public async Task<HttpResponseMessage> Post(InvoicePointsBase oInvoicePointsBase)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<InfoAccumulatedPointsDataUI> oCLContext = await Process.AccumulatedPoints(oInvoicePointsBase);

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
        
        [Route("~/api/Lealto/Redimir")]
        public async Task<HttpResponseMessage> Post(InvoiceRedeemPoint oInvoiceRedeemPoint)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<InfoRedeemPointsUI> oCLContext = await Process.RedeemPoints(oInvoiceRedeemPoint);

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