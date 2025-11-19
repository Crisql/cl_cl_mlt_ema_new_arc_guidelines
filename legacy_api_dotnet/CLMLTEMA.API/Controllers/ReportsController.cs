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
    [CompanyBinderActionFilter]
    [Authorize]
    public class ReportsController : ApiController
    {
        [HttpGet]
        [Route("api/Reports/{printFormatName}/{docEntry:int}/Print")]
        public async Task<HttpResponseMessage> Print(int docEntry, string printFormatName)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<DownloadBase64> oCLContext = await Process.PrintReport(docEntry, printFormatName);

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
        
        [HttpPost] 
        [Route("api/Reports/PrintVoucher")]
        public HttpResponseMessage PrintVoucher(PrintPinpad _transaction)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<string> oCLContext = Process.PrintVoucher(_transaction);

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
        
        [HttpPost] 
        [Route("api/Reports/{printFormatName}/PrintReportPinpad")]
        public HttpResponseMessage PrintReportPinpad(string printFormatName, PrintPinpad _transaction)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<string> oCLContext = Process.PrintReportPinpad(_transaction, printFormatName);

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