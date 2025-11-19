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
    public class RouteAssignmentsController : ApiController
    {
        // GET: /api/RouteAssignments/1
        [HttpGet]
        [Route("api/RouteAssignments/{routeId}")]
        public HttpResponseMessage Get(int routeId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<RouteAssignment>> oCLContext = Process.GetRouteAssignment(routeId);

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

        public async Task<HttpResponseMessage> Post(List<RouteAssignment> routeAssignments)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<RouteAssignment>> oCLContext = await Process.PostRouteAssignment(routeAssignments);

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
        
        public async Task<HttpResponseMessage> Patch(List<RouteAssignment> routeAssignments)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<RouteAssignment>> oCLContext = await Process.PatchRouteAssignment(routeAssignments);

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