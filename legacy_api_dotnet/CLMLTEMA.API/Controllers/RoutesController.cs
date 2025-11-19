using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CL.COMMON;
using CL.COMMON.ActionFilters.ServiceLayer;
using CL.STRUCTURES.CLASSES.Rebound;
using CLMLTEMA.MODELS;
using CLMLTEMA.PROCESS;

namespace CLMLTEMA.API.Controllers
{
    [Authorize]
    [CompanyBinderActionFilter]
    public class RoutesController : ApiController
    {
        /// <summary>
        /// This endpoint is used to get routs by filter
        /// </summary>
        /// <param name="startDate">StarDate filter</param>
        /// <param name="endDate">End Date filter</param>
        /// <param name="state">Status</param>
        /// <param name="userAssing">User assing</param>
        /// <param name="routeName">Route Name</param>
        /// <returns></returns>
        [EnablePagination]
        public HttpResponseMessage Get(DateTime startDate, DateTime endDate, int state, int userAssing = 0, string routeName = "")
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<PresentationRoute>> oCLContext =
                    Process.GetRoutes(routeName, userAssing, startDate, endDate, state);

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
        
        [Route("api/Routes/{id}")]
        public HttpResponseMessage Get(int id)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Route> oCLContext = Process.GetRoute(id);

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
        [Route("api/Routes/{RouteId}/Lines")]
        public HttpResponseMessage GetRouteLines(int RouteId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<RouteLine>> oCLContext = Process.GetRouteLines(RouteId);

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
        [Route("api/Routes/{RouteId}/Administrators")]
        public HttpResponseMessage GetRouteAdministrators(int RouteId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<RouteAdministrator>> oCLContext = Process.GetRouteAdministrators(RouteId);

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
        [Route("api/Routes/{routeId}/Administrators")]
        public HttpResponseMessage PostRouteAdministrators(List<RouteAdministrator> _administrators, int routeId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<bool> oCLContext = Process.CreateRouteAdministrators(_administrators, routeId);

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
        [Route("api/Routes/{routeId}/Assignments")]
        public HttpResponseMessage PostRouteAssignments(List<RouteAssignment> _assignments, int routeId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<bool> oCLContext = Process.CreateRouteAssignments(_assignments, routeId);

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
        [Route("api/Routes/{routeId}/Close")]
        public async Task<HttpResponseMessage> CloseRoute(Route _route, int routeId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Route> oCLContext = await Process.CloseRoute(_route,routeId);

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
        [Route("api/Routes/ProcessedRoutes")]
        public async Task<HttpResponseMessage> CreateProcessedRoutes(List<ProcessedRoute> _processedRoutes)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<List<ProcessedRoute>> oCLContext = await Process.CreateProcessedRoutes(_processedRoutes);

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
        
        public HttpResponseMessage Post(RouteWithLines _routeWithLines)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Route> oCLContext = Process.CreateRoute(_routeWithLines);

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
        
        public async Task<HttpResponseMessage> Patch(RouteWithLines _routeWithLines)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Route> oCLContext = await Process.UpdateRoute(_routeWithLines);

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
        [Route("api/Routes/{routeId}/AssignedUsers")]
        public HttpResponseMessage GetRouteAssignedUsers(int routeId)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<IEnumerable<User>> oCLContext = Process.GetRouteAssignedUsers(routeId);

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
        
        [HttpPatch]
        [Route("api/Routes/{routeId}")]
        public HttpResponseMessage PatchStatus(int routeId, int newStatus)
        {
            try
            {
                LogManager.Record("CONTROLLER STARTED");

                CLContext<Route> oCLContext = Process.UpdateRouteStatus(routeId, newStatus);

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