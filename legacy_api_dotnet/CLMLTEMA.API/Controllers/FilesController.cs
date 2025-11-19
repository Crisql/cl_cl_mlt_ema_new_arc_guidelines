using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using CL.COMMON;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class FilesController : ApiController
    {
        [HttpPost]
        [Route("api/Files/RoutesTemplate")]
        public async Task<HttpResponseMessage> ProcessRouteTemplate()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                
                HttpRequest HttpRequest = HttpContext.Current.Request;
                
                HttpPostedFile File = HttpRequest.Files[$"file"];

                CLContext<List<ProcessedRoute>> oCLContext = await Process.ProcessRouteTemplate(File);

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
        
        [HttpGet]
        [Route("api/Files/RoutesTemplate/Download")]
        public async Task<HttpResponseMessage> DownloadRouteTemplate()
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<MODELS.DownloadBase64> oCLContext = await Process.DownloadRouteMassiveTemplateFile();

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