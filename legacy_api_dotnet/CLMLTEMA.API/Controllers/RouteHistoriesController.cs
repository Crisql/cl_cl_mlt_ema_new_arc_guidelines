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
    public class RouteHistoriesController : ApiController
    {
        [Route("api/RouteHistories/{routeId}")]
        public HttpResponseMessage Get(int routeId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                    
                HttpRequest HttpRequest = HttpContext.Current.Request;
                    
                HttpPostedFile File = HttpRequest.Files[$"file"];

                CLContext<IEnumerable<RouteHistory>> oCLContext = Process.GetRouteHistories(routeId);

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
        
        // [Route("api/RouteHistories")]
        public async Task<HttpResponseMessage> Post(List<RouteHistory> routeHistories)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");
                
                CLContext<IEnumerable<RouteHistory>> oCLContext = await Process.PostRouteHistories(routeHistories);

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