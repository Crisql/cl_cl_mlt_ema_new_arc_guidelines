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
    [Authorize]
    [CompanyBinderActionFilter]
    public class CashClosingsController : ApiController
    {
        [Route("api/CashClosings/SendEmail")]
        public async Task<HttpResponseMessage> Post(SendClashClosingReport _closingReport)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<string> oCLContext = await Process.SendCashClosing(_closingReport);

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
        
        public async Task<HttpResponseMessage> Post(PaydeskBalance opaydeskBalance)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<PaydeskBalance> oCLContext = await Process.CashClosing(opaydeskBalance);

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
        
        public async Task<HttpResponseMessage> Get(string url)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<string> oCLContext = await Process.GetReport(url);

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
        
        public HttpResponseMessage Get(string user, DateTime dateFrom,
            DateTime dateTo)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<PaydeskBalance>> oCLContext = Process.GetCashClosing(user,dateFrom,dateTo);

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