using System;
using System.Net.Http;
using System.Web.Http;
using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class LocalPrintersController : ApiController
    {
        
        public HttpResponseMessage Post(LocalPrinter LocalPrinter)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<LocalPrinter> oCLContext =  Process.PostLocalPrinter(LocalPrinter);

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
        
        public HttpResponseMessage Patch(LocalPrinter LocalPrinter)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<LocalPrinter> oCLContext =  Process.PatchLocalPrinter(LocalPrinter);

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
        
        [Route("~/api/LocalPrinters/PrinterName")]
        [HttpPatch]
        public HttpResponseMessage PatchPrinterName(SelectedPrinterName PrinterName)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<SelectedPrinterName> oCLContext =  Process.PatchPrinterNameLocalPrinter(PrinterName);

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
        
        public HttpResponseMessage Get(int userAssingId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<LocalPrinter> oCLContext = Process.GetLocalPrinter(userAssingId);

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